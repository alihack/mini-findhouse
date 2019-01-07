import wepy from 'wepy'
import api from './api'
import QQMapWX from './qqmap-wx-jssdk'
import webim from './webim_wx'
var qiniuUploader = require('./qiniuUploader')
const getUserId = (isForced) => {
	return new Promise(async resolve => {
		console.log('调用getUserId方法')
		const uid = wx.getStorageSync('uid')
		// 有uid则不重新获取
		if (uid && !isForced) {
			console.log('有uid不重新获取')
			resolve(uid)
			return
		}
		wx.login({
			success: async (res) => {
				if (res.code) {
					console.log(res)
					const {data} = await wepy.request({
						url: api['userId'] + `?code=${res.code}`,
					})
					if (!data.uid) {
						resolve('')
					} else {
						wx.setStorageSync('uid', data.uid)
						wx.setStorageSync('type', data.type)  // 1-普通用户 2-经纪人
						resolve(data.uid)
					}
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
	})
}

const checkSession = () => {
	return new Promise(resolve => {
		wx.checkSession({
			success: async () => {
				console.log('session_key未过期，并且在本生命周期一直有效')
				resolve()
			},
			fail: async () => {
				console.log('session_key 已经失效，需要重新执行登录流程')
				await getUserId(true) // 强制获取
				resolve()
			}
		})
	})
}

const getUserInfo = () => {
	return new Promise(async resolve => {
		console.log('调用getUserInfo方法')
		const uid = wx.getStorageSync('uid')
		const {data: {userInfo}} = await wepy.request({
			url: api['userInfo'],
			data: {
				uid
			}
		})
		wepy.$instance.globalData.myUserInfo = userInfo
		loginInfo.identifierNick = userInfo.nickname
		loginInfo.identifierAvatar = userInfo.headimg
		console.log('loginInfo', loginInfo)
		console.log('修改后的全局数据', wepy.$instance.globalData)
		resolve()
	})
}

const getLocation = () => {
	return new Promise(async resolve => {
		console.log('调用getLocation方法')
		const locationInfo = wx.getStorageSync('locationInfo')
		// 有locationInfo则不重新获取
		if (locationInfo) {
			console.log('有locationInfo不重新获取')
			resolve()
			return
		}
		// 实例化API核心类
		const qqmapsdk = new QQMapWX({
			key: 'KUBBZ-HYIKF-II2J3-NYSEA-IY3ZQ-KTBP3'
		})
		wx.getLocation({
			type: 'gcj02',
			success: res => {
				let locationInfo = {}
				qqmapsdk.reverseGeocoder({
					location: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					success: ({result: {ad_info}}) => {
						locationInfo.name = ad_info.city.slice(0, ad_info.city.length - 1)
						locationInfo.code = ad_info.city_code.slice(3)
						locationInfo.location = ad_info.location
					},
					fail: (res) => {
						console.log(res)
					},
					complete: (res) => {
						console.log('info', locationInfo)
						wx.setStorageSync('locationInfo', locationInfo)
						resolve(locationInfo)
					}
				})
			}
		})
		// wx.setStorageSync('locationInfo', {name: '厦门', code: '350200'})
	})
}

const dataController = (ele) => {
	return new Promise(async resolve => {
	})
}

const getSign = () => {
	return new Promise(async resolve => {
		const uid = wx.getStorageSync('uid')
		loginInfo.identifier = uid
		const {data} = await wepy.request({
			url: api['sign'],
			data: {
				identifier: uid
			},
			method: 'POST'
		})
		loginInfo.userSig = data
		resolve()
	})
}
// 当前用户身份
var loginInfo = {
	'sdkAppID': 1400175041, // 用户所属应用id
	'appIDAt3rd': 1400175041, // 用户所属应用id
	'accountType': 36862, // 用户所属应用帐号类型
	'identifier': '', // 当前用户ID
	'identifierNick': '', // 当前用户昵昵称
	'identifierAvatar': '', // 用户头像
	// 'Tag_Profile_Custom_avatar': '' // 用户头像
	'userSig': ''
}
const initIM = (onMsgNotify) => {
	return new Promise(async resolve => {
		// 获取sign
		if (!loginInfo.userSig) await getSign()
		// 监听事件
		const onConnNotify = (resp) => {
			// 监听连接状态回调变化事件
			var info
			switch (resp.ErrorCode) { // 链接状态码
				case webim.CONNECTION_STATUS.ON:
					webim.Log.warn('建立连接成功: ' + resp.ErrorInfo)
					break
				case webim.CONNECTION_STATUS.OFF:
					info = '连接已断开，无法收到新消息，请检查下您的网络是否正常: ' + resp.ErrorInfo
					alert(info)
					webim.Log.warn(info)
					break
				case webim.CONNECTION_STATUS.RECONNECT:
					info = '连接状态恢复正常: ' + resp.ErrorInfo
					alert(info)
					webim.Log.warn(info)
					break
				default:
					webim.Log.error('未知连接状态: =' + resp.ErrorInfo) // 错误信息
					break
			}
		}

		var listeners = {
			'onConnNotify': onConnNotify, // 监听连接状态回调变化事件,必填
			'onMsgNotify': onMsgNotify, // 监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
		}

		// 其他对象，选填
		var options = {
			'isAccessFormalEnv': true, // 是否访问正式环境，默认访问正式，选填
			'isLogOn': false // 是否开启控制台打印日志,默认开启，选填
		}
		const cbOk = (e) => {
			console.log('登录成功', e)
			resolve()
		}
		const cbErr = (e) => {
			console.log('登录失败', e)
			resolve()
		}
		// sdk登录
		webim.login(loginInfo, listeners, options, cbOk, cbErr)
	})
}

const sendMessage = (msgtosend, selToID, isCustomMsg) => {
	return new Promise(resolve => {
		var msg
		var isSend = true
		var seq = -1// 消息序列，-1表示 SDK 自动生成，用于去重
		var random = Math.round(Math.random() * 4294967296)// 消息随机数，用于去重
		var msgTime = Math.round(new Date().getTime() / 1000)// 消息时间戳
		var subType = webim.C2C_MSG_SUB_TYPE.COMMON // 消息子类型
		var selType = webim.SESSION_TYPE.C2C
		var selSess = new webim.Session(selType, selToID, selToID, loginInfo.identifierAvatar, Math.round(new Date().getTime() / 1000))
		msg = new webim.Msg(selSess, isSend, seq, random, msgTime, loginInfo.identifier, subType, loginInfo.identifierNick)
		// 解析文本和表情
		var textObj, faceObj, customObj, tmsg, emotionIndex, emotion, restMsgIndex
		var expr = /\[[^[\]]{1,3}\]/mg
		var emotions = msgtosend.match(expr)
		if (!emotions || emotions.length < 1) {
			if (isCustomMsg) {
				customObj = new webim.Msg.Elem.Custom(msgtosend)
				msg.addCustom(customObj)
			} else {
				textObj = new webim.Msg.Elem.Text(msgtosend)
				msg.addText(textObj)
			}
		} else {
			for (var i = 0; i < emotions.length; i++) {
				tmsg = msgtosend.substring(0, msgtosend.indexOf(emotions[i]))
				if (tmsg) {
					textObj = new webim.Msg.Elem.Text(tmsg)
					msg.addText(textObj)
				}
				emotionIndex = webim.EmotionDataIndexs[emotions[i]]
				emotion = webim.Emotions[emotionIndex]
				if (emotion) {
					faceObj = new webim.Msg.Elem.Face(emotionIndex, emotions[i])
					msg.addFace(faceObj)
				} else {
					textObj = new webim.Msg.Elem.Text(emotions[i])
					msg.addText(textObj)
				}
				restMsgIndex = msgtosend.indexOf(emotions[i]) + emotions[i].length
				msgtosend = msgtosend.substring(restMsgIndex)
			}
			if (msgtosend) {
				textObj = new webim.Msg.Elem.Text(msgtosend)
				msg.addText(textObj)
			}
		}
		console.log('发送消息', msg)
		webim.sendMsg(msg,
			(resp) => {
				console.log('发送消息成功', resp)
				resolve('ok')
			},
			(err) => {
				console.log('发送消息失败', err)
				resolve('fail')
			}
		)
	})
}

const getUnread = () => {
	return new Promise(resolve => {
		var selType = webim.SESSION_TYPE.C2C
		var selSess = new webim.Session(selType, loginInfo.identifier, loginInfo.identifierNick, loginInfo.identifierAvatar, Math.round(new Date().getTime() / 1000))
		//	获取所有会话
		var sessMap = webim.MsgStore.sessMap()
		// const num = sessMap['C2C2'].
		console.log('未读消息数map', sessMap)
		console.log('未读消息数', selSess)
		resolve()
	})
}

const getC2CHistoryMsgs = (friendID) => {
	return new Promise(resolve => {
		var lastMsgTime = 0 // 第一次拉取好友历史消息时，必须传 0
		var msgKey = ''
		var options = {
			'Peer_Account': friendID, // 好友帐号
			'MaxCnt': 15, // 拉取消息条数
			'LastMsgTime': lastMsgTime, // 最近的消息时间，即从这个时间点向前拉取历史消息
			'MsgKey': msgKey
		}
		webim.getC2CHistoryMsgs(
			options,
			async (resp) => {
				// var complete = resp.Complete// 是否还有历史消息可以拉取，1-表示没有，0-表示有
				// var retMsgCount = resp.MsgCount// 返回的消息条数，小于或等于请求的消息条数，小于的时候，说明没有历史消息可拉取了
				// getPrePageC2CHistroyMsgInfoMap['2'] = {// 保留服务器返回的最近消息时间和消息Key,用于下次向前拉取历史消息
				// 	'LastMsgTime': resp.LastMsgTime,
				// 	'MsgKey': resp.MsgKey
				// }
				console.log('最近历史记录', resp.MsgList)
				const MsgList = resp.MsgList
				const Msglength = resp.MsgList.length
				const data = []
				for (let i in MsgList) {
					const item = {}
					const html = await convertCustomMsgToHtml(MsgList[i])
					if (html.houseCard) {
						// 自定义房源消息
						item.houseCard = html.houseCard
					} else {
						if (html.indexOf('qimg.fangzi.xiaoyu.com/img') != -1) {
							// 图片消息
							item.img = 'http://' + html
						} else if (html.indexOf('qimg.fangzi.xiaoyu.com/audio') != -1) {
							// 语音消息
							item.audio = 'http://' + html
						} else {
							// 文字消息
							item.html = html
						}
					}
					item.time = convertTime(MsgList[i].time * 1000)
					item.isSelfSend = MsgList[i].isSend
					data.push(item)
				}
				// 按时间分类
				const map = {}
				const newMsgList = []
				data.forEach(ele => {
					if (!map[ele.time]) {
						newMsgList.push({
							time: ele.time,
							data: [ele]
						})
						map[ele.time] = ele
					} else {
						newMsgList.forEach(des => {
							if (des.time == ele.time) {
								des.data.push(ele)
								return
							}
						})
					}
				})
				console.log('新历史记录', newMsgList)
				resolve({newMsgList, Msglength})
			},
			(err) => {
				console.log('获取历史记录失败', err)
				resolve()
			}
		)
	})
}

const getRecentContactList = () => {
	return new Promise(resolve => {
		webim.getRecentContactList(
			{'Count': 20},
			({SessionItem}) => {
				console.log('最近联系人', SessionItem)
				resolve(SessionItem)
			},
			(err) => {
				console.log('err', err)
				resolve()
			}
		)
	})
}

const quitIM = () => {
	return new Promise(resolve => {
		webim.logout(
			(resp) => {
				console.log('退出IM成功', resp)
			},
			(err) => {
				console.log('退出IM失败', err)
			}
		)
	})
}

const convertCustomMsgToHtml = (msg) => {
	return new Promise(resolve => {
		// eslint-disable-next-line one-var
		var html = '', elems, elem, type, content
		elems = msg.getElems()// 获取消息包含的元素数组
		for (var i in elems) {
			elem = elems[i]
			type = elem.getType()// 获取元素类型
			content = elem.getContent()// 获取元素对象
			switch (type) {
				case webim.MSG_ELEMENT_TYPE.TEXT:
					html += content.getText()
					break
				// case webim.MSG_ELEMENT_TYPE.FACE:
				// 	html += convertFaceMsgToHtml(content)
				// 	break
				// case webim.MSG_ELEMENT_TYPE.IMAGE:
				// 	html += convertImageMsgToHtml(content)
				// 	break
				// case webim.MSG_ELEMENT_TYPE.SOUND:
				// 	html += convertSoundMsgToHtml(content)
				// 	break
				// case webim.MSG_ELEMENT_TYPE.FILE:
				// 	html += convertFileMsgToHtml(content)
				// 	break
				// case webim.MSG_ELEMENT_TYPE.LOCATION:// 暂不支持地理位置
				// 	// html += convertLocationMsgToHtml(content);
				// 	break
				case webim.MSG_ELEMENT_TYPE.CUSTOM:
					try {
						html = {}
						html = JSON.parse(content.getData())
					} catch (e) {
						console.log('e', e)
					}
					break
				// case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
				// 	html += convertGroupTipMsgToHtml(content)
				// 	break
				default:
					webim.Log.error('未知消息元素类型: elemType=' + type)
					break
			}
		}
		resolve(html)
	})
}

const convertTime = (timeStamp) => {
	const date = new Date(timeStamp)
	const year = date.getFullYear()
	const month = formatNumber(date.getMonth() + 1)
	const day = formatNumber(date.getDate())
	const hour = formatNumber(date.getHours())
	const minute = formatNumber(date.getMinutes())
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
  }

const getDateDiff = (dateTimeStamp) => {
	var result
	var minute = 1000 * 60
	var hour = minute * 60
	var day = hour * 24
	var month = day * 30
	var now = new Date().getTime()
	var diffValue = now - dateTimeStamp
	if (diffValue < 0) {
		return
	}
	var monthC = diffValue / month
	var weekC = diffValue / (7 * day)
	var dayC = diffValue / day
	var hourC = diffValue / hour
	var minC = diffValue / minute
	if (monthC >= 1) {
		if (monthC <= 12)		{
			result = '' + parseInt(monthC) + '月前'
		} else {
			result = '' + parseInt(monthC / 12) + '年前'
		}
	} else if (weekC >= 1) {
		result = '' + parseInt(weekC) + '周前'
	} else if (dayC >= 1) {
		result = '' + parseInt(dayC) + '天前'
	} else if (hourC >= 1) {
		result = '' + parseInt(hourC) + '小时前'
	} else if (minC >= 1) {
		result = '' + parseInt(minC) + '分钟前'
	} else {
		result = '刚刚'
	}
	return result
}

const uploadQiNiu = (filePath, type) => {
	return new Promise(async (resolve) => {
		console.log('file', filePath)
		var key
		if (type == 'audio') {
			key = `audio${Date.now()}.mp3`
		} else {
			key = `img${Date.now()}.jpg`
		}
		const {data: {uptoken}} = await wepy.request({
			url: api['uptoken'],
		})
		console.log('uptoken', uptoken)
		const options = {
			region: 'ECN', // 此为华东地区代码
			useCdnDomain: true,
			domain: 'qimg.fangzi.xiaoyu.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
			key: key, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
			uptoken: uptoken
		}
		qiniuUploader.upload(filePath, (res) => resolve(res), (err) => console.log(err), options)
	})
}

module.exports = {
	getUserId,
	getUserInfo,
	getSign,
	getLocation,
	dataController,
	checkSession,
	initIM,
	quitIM,
	sendMessage,
	getUnread,
	getC2CHistoryMsgs,
	getRecentContactList,
	convertTime,
	getDateDiff,
	loginInfo,
	convertCustomMsgToHtml,
	uploadQiNiu
}
