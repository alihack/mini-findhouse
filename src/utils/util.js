import wepy from 'wepy'
import api from './api'
import QQMapWX from './qqmap-wx-jssdk'

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
						url: api['getUserId'],
						data: {
							code: res.code
						}
					})
					if (!data.uid) {
						resolve('')
					} else {
						wx.setStorageSync('uid', data.uid)
						resolve(data.uid)
					}
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
	})
}

const getUserInfo = () => {
	return new Promise(async resolve => {
		console.log('调用getUserInfo方法')
		const uid = wx.getStorageSync('uid')
		// 有myUserInfo则不重新获取
		if (!uid) {
			console.log('没有uid不重新获取UserInfo')
			resolve()
			return
		}
		const {data: {userInfo}} = await wepy.request({
			url: api['getUserInfo'],
			data: {
				uid
			}
		})
		wepy.$instance.globalData.myUserInfo = userInfo
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

module.exports = {
	getUserId,
	getUserInfo,
	getLocation,
	dataController
}
