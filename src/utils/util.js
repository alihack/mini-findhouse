import wepy from 'wepy'
import api from './api'
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
						url: api['user/userId'] + `?code=${res.code}`,
					})
					if (!data.uid) {
						resolve('')
					} else {
						wx.setStorageSync('uid', data.uid)
						wx.setStorageSync('type', data.type)  // 1-普通用户 2-经纪人
						if (data.type == '2') {
							wx.setStorageSync('aid', data.uid)
						}
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
	console.log('调用checkSession方法')
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

const getUserInfo = (isForced) => {
	return new Promise(async resolve => {
		console.log('调用getUserInfo方法')
		const uid = wx.getStorageSync('uid')
		const myInfo = wx.getStorageSync('userInfo')
		// 有uid则不重新获取
		if (myInfo && !isForced) {
			console.log('有myInfo不重新获取')
			wepy.$instance.globalData.myUserInfo = myInfo
			resolve(myInfo)
			return
		}
		const {data: {userInfo}} = await wepy.request({
			url: api['user/userInfo'],
			data: {
				uid
			}
		})
		// 手机号脱敏处理
		const mobile = userInfo.mobile.replace(/(^\s*)|(\s*$)/g, '')
		if (mobile.length == 11) userInfo.mobile = mobile.replace(mobile.slice(3, 9), '****')
		wx.setStorageSync('userInfo', userInfo)
		wepy.$instance.globalData.myUserInfo = userInfo
		// 如果是经纪人登录，需要设置aid缓存
		if (userInfo.type == '2') {
			wx.setStorageSync('aid', userInfo.uid)
		}
		resolve(userInfo)
	})
}

const getMarket = () => {
	return new Promise(async resolve => {
		let market = {}
		const {data} = await wepy.request({
			url: api['house/getMarket'],
		})
		market.price = data.total_price
		if (data.ratio.indexOf('-') != -1) {
			market.ratio = data.ratio.slice(1)
			market.isDecline = true
		} else {
			market.ratio = data.ratio
			market.isDecline = false
		}
		resolve(market)
	})
}

/*
	以下为云通信所需自定义方法
*/

// ========云通信登录及退出==========

var loginInfo = {
	'sdkAppID': 1400175041, // 用户所属应用id
	'appIDAt3rd': 1400175041, // 用户所属应用id
	'accountType': 36862, // 用户所属应用帐号类型
	'identifier': '', // 当前用户ID
	'userSig': ''
}
const getSign = () => {
	return new Promise(async resolve => {
		const uid = wx.getStorageSync('uid')
		const userSig = wx.getStorageSync('userSig')
		loginInfo.identifier = uid
		let isOutDate = false
		if (userSig) {
			const nowTime = new Date().getTime()
			const diffDay = (nowTime - userSig.time) / 86400000
			if (diffDay > 160) {
				isOutDate = true
			} else {
				console.log('sign未过期，相差天数：', diffDay)
				loginInfo.userSig = userSig.data
				resolve()
				return
			}
		}
		if (!userSig || isOutDate) {
			// 如果不存在或者过期了，重新获取（180天过期，得提前获取）
			const {data} = await wepy.request({
				url: api['user/sign'],
				data: {
					identifier: uid
				},
				method: 'POST'
			})
			loginInfo.userSig = data
			resolve()
			wx.setStorageSync('userSig', {data, time: new Date().getTime()})
			return
		}
	})
}
const initIM = (onMsgNotify) => {
	return new Promise(async resolve => {
		// 获取sign
		if (!loginInfo.userSig) await getSign()

		var listeners = {
			// 'onConnNotify': onConnNotify, // 监听连接状态回调变化事件,必填
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

// ===========消息文本处理============

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
				case webim.MSG_ELEMENT_TYPE.CUSTOM:
					try {
						html = {}
						html = JSON.parse(content.getData())
					} catch (e) {
						console.log('e', e)
					}
					break
				default:
					webim.Log.error('未知消息元素类型: elemType=' + type)
					break
			}
		}
		resolve(html)
	})
}

const convertTime = (timeStamp, noHour = false, noSec = false) => {
	return new Promise(resolve => {
		const date = new Date(timeStamp)
		const year = date.getFullYear()
		const month = formatNumber(date.getMonth() + 1)
		const day = formatNumber(date.getDate())
		const hour = formatNumber(date.getHours())
		const minute = formatNumber(date.getMinutes())
		const second = formatNumber(date.getSeconds())
		if (noHour) {
			resolve(year + '-' + month + '-' + day)
		} else if (noSec) {
			resolve(year + '-' + month + '-' + day + ' ' + hour + ':' + minute)
		} else {
			resolve(year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second)
		}
	})
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

// ==========消息未读数处理============

const getAllUnread = (contactList) => {
	if (!contactList) return
	const allUnread = contactList.reduce((total, item) => {
		return total + item.unread
	}, 0)
	if (allUnread) {
		wx.setTabBarBadge({
			index: 1,
			text: allUnread.toString()
		})
	} else {
		wx.removeTabBarBadge({index: 1})
	}
}

const setSessionUnread = (contactList) => {
	return new Promise(resolve => {
		webim.syncMsgs((res) => {
			var sessMap = webim.MsgStore.sessMap()
			contactList.forEach(ele => {
				ele.unread = sessMap['C2C' + ele.id] ? sessMap['C2C' + ele.id].unread() : 0
			})
			resolve(contactList)
			getAllUnread(contactList)
		}, (err) => {
			console.log('err', err)
			resolve()
		})
	})
}
// =========聊天列表页========

const getContactFromTx = () => {
	return new Promise(resolve => {
		webim.getRecentContactList(
			{'Count': 100},
			async ({SessionItem}) => {
				// 将腾讯返回的最近联系人传给后端（腾讯时效性只有七天）
				let newSessions = []
				if (SessionItem) {
					SessionItem.forEach(ele => {
						let item = {}
						item.id = ele.To_Account
						if (ele.MsgShow == '[其他]') {
							ele.MsgShow = '[房源信息]'
						} else if (ele.MsgShow.indexOf('qimg.fangzi.xiaoyu.com/img') != -1) {
							ele.MsgShow = '[图片信息]'
						} else if (ele.MsgShow.indexOf('qimg.fangzi.xiaoyu.com/audio') != -1) {
							ele.MsgShow = '[语音信息]'
						}
						item.content = ele.MsgShow
						item.timeStamp = ele.MsgTimeStamp
						newSessions.push(item)
					})
				}
				resolve(JSON.stringify(newSessions))
			},
			(err) => {
				console.log('err', err)
				resolve()
			}
		)
	})
}

const saveContactList = (contactList, setUnread = false) => {
	return new Promise(async resolve => {
		const uid = wx.getStorageSync('uid')
		if (setUnread) {
			let newContactList = []
			let promises = contactList.map(ele => {
				return new Promise(resolve => {
					let item = {}
					item.id = ele.id
					item.unread = ele.unread
					newContactList.push(item)
					resolve()
				})
			})
			Promise.all(promises).then(async () => {
				await wepy.request({
					url: api['user/saveContactList'],
					method: 'POST',
					data: {
						uid,
						contactList: JSON.stringify(newContactList)
					}
				})
				resolve()
			})
		} else {
			await wepy.request({
				url: api['user/saveContactList'],
				method: 'POST',
				data: {
					uid,
					contactList
				}
			})
			resolve()
		}
	})
}

const getContactFromServer = () => {
	return new Promise(async resolve => {
		// 先从腾讯获取最近聊天列表
		const contactFromTx = await getContactFromTx() // 耗时0.12
		// 保存至后端
		if (contactFromTx == '[]') {
			resolve('')
			return
		}
		await saveContactList(contactFromTx)
		// 再从后端获取全部列表
		const uid = wx.getStorageSync('uid')
		const {data} = await wepy.request({
			url: api['user/getContactList'],
			data: {
				uid
			}
		})
		// 按时间排序
		const newData = data.sort((a, b) => b.timeStamp - a.timeStamp)
		resolve(newData)
	})
}

// =======与服务器的数据请求=========

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
				resolve(resp.MsgTime)
			},
			(err) => {
				console.log('发送消息失败', err)
				resolve('fail')
			}
		)
	})
}

const getC2CHistoryMsgs = (friendID, isSaveServer = false) => {
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
					item.time = await convertTime(MsgList[i].time * 1000)
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
				if (isSaveServer) {
					// 将新历史记录处理后发送给后端服务器,标记已读
					const newMsgList2 = JSON.parse(JSON.stringify(newMsgList))
					const msgsToServerList = []
					newMsgList2.forEach(ele => {
						ele.data = JSON.stringify(ele.data)
						msgsToServerList.push(ele)
					})
					await sendMsgsToServer(friendID, msgsToServerList)
				}
				resolve({newMsgList, Msglength})
			},
			(err) => {
				console.log('获取历史记录失败', err)
				resolve()
			}
		)
	})
}
const sendMsgsToServer = (fid, msg) => {
	return new Promise(async resolve => {
		await wepy.request({
			url: api['user/saveChatMsgs'],
			method: 'POST',
			data: {
				uid: loginInfo.identifier,
				fid,
				msg: JSON.stringify(msg),
			}
		})
		resolve()
	})
}
// 获取单个聊天记录
const getMsgsFromServer = (fid, hasSec = 0) => {
	return new Promise(async resolve => {
		let form = {
			uid: loginInfo.identifier,
			fid,
			hasSec
		}
		// if (page) form.page = page
		const msgList = await wepy.request({
			url: api['user/getChatMsgs'],
			data: form
		})
		resolve(msgList)
	})
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
			url: api['user/uptoken'],
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

// ======APP登录监听IM总流程======

const onMsgNotify = (newMsgs) => {
	console.log('列表页新信息', newMsgs)
	wepy.$instance.globalData.newMsgs = newMsgs
	const sessionStorage = wx.getStorageSync('sessionStorage')
	// 无聊天缓存说明新增对象,重新进
	if (!sessionStorage) {
		// 此处必须延时，腾讯接口有延时！
		setTimeout(async () => {
			await myInitIM()
		}, 1000)
		return
	}
	// 先判断是否有新增对象
	let sessionIds = []
	let newMsgIds = []
	sessionStorage.forEach(ele => {
		sessionIds.push(ele.id)
	})
	newMsgs.forEach(ele => {
		newMsgIds.push(ele.fromAccount)
	})
	newMsgIds.forEach(async ele => {
		if (!sessionIds.includes(ele)) {
			console.log('新增聊天对象', ele)
			// 此处必须延时，腾讯接口有延时！
			setTimeout(async () => {
				await myInitIM()
			}, 1000)
			return
		}
	})
	// 无新增聊天对象继续执行
	sessionStorage.forEach(async (ele, index) => {
		let promises = newMsgs.map(async (msg, msgIndex) => {
			return new Promise(async resolve => {
				if (msg.fromAccount == ele.id) {
					ele.unread = ele.unread ? ele.unread + 1 : 1
					ele.time = '刚刚'
					ele.timeStamp = ele.MsgTimeStamp
					ele.content = await convertCustomMsgToHtml(msg)
					if (ele.content.houseCard) {
						// 自定义房源消息
						ele.content = '[房源信息]'
					} else {
						if (ele.content.indexOf('qimg.fangzi.xiaoyu.com/img') != -1) {
							// 图片消息
							ele.content = '[图片信息]'
						} else if (ele.content.indexOf('qimg.fangzi.xiaoyu.com/audio') != -1) {
							// 语音消息
							ele.content = '[语音信息]'
						}
					}
					sessionStorage.splice(index, 1)
					sessionStorage.unshift(ele)
				}
				resolve()
			})
		})
		Promise.all(promises).then(() => {
			if (index == sessionStorage.length - 1) {
				getAllUnread(sessionStorage)
				wx.setStorageSync('sessionStorage', sessionStorage)
				return
			}
		})
	})
}

const myInitIM = () => {
	return new Promise(async resolve => {
		if (!webim.checkLogin()) await initIM(onMsgNotify) // 耗时1.3秒
		// 首先判断有无会话列表
		const contactList = await getContactFromServer() // 耗时0.5秒
		if (!contactList) {
			console.log('无聊天记录')
			resolve()
			return
		}
		// 从腾讯获取未读数
		const initSessionList = await setSessionUnread(contactList) // 耗时0.17秒
		// 进一步数据处理（时间）
		const finishSessionList = await nextSessionController(initSessionList) // 耗时0.07秒
		console.log('最终会话列表数据', finishSessionList)
		wx.setStorageSync('sessionStorage', finishSessionList)
		wx.hideLoading()
		resolve()
	})
}

const nextSessionController = (initSessionList) => {
	return new Promise(async resolve => {
		let promises = initSessionList.map(async (ele, index) => {
			return new Promise(async resolve => {
				ele.initIndex = index
				ele.time = getDateDiff(ele.timeStamp * 1000)
				resolve()
			})
		})
		Promise.all(promises).then(() => {
			// 防止时间错乱
			initSessionList = initSessionList.sort((a, b) => a.initIndex - b.initIndex)
			resolve(initSessionList)
		})
	})
}
module.exports = {
	getUserId,
	getUserInfo,
	getMarket,
	getSign,
	checkSession,
	initIM,
	quitIM,
	sendMessage,
	setSessionUnread,
	getAllUnread,
	getC2CHistoryMsgs,
	convertTime,
	getDateDiff,
	loginInfo,
	convertCustomMsgToHtml,
	uploadQiNiu,
	sendMsgsToServer,
	getMsgsFromServer,
	myInitIM,
	saveContactList
}
