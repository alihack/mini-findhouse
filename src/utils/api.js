const roots = {
	prod: 'https://api.hd.xiaoyu.com/wxapp/fnzf/',
	test: 'https://api.test.haodian.cn/wxapp/fnzf/'
	// test: 'https://hd-api.dev.xiaoyu.com/index.php/wxapp/fnzf/'
}

const apis = [
	// 用户
	'user/userId',
	'user/saveUser',
	'user/userInfo',
	'user/userMobile',
	'user/sendCode',
	'user/mobileLogin',
	'user/followList',
	'user/history',
	'user/follow',
	'user/cancelFollow',
	'user/saveFromId',
	'user/sign', // 云通信签名
	'user/uptoken',
	'user/saveChatMsgs', // 保存单个聊天记录
	'user/getChatMsgs', // 获取单个聊天记录
	'user/saveContactList', // 保存聊天列表
	'user/getContactList', // 获取聊天列表
	// 经纪人
	'agent/agentLogin',
	'agent/sendAgentCode',
	'agent/clickCount',
	// 房源
	'house/houseList',
	'house/houseInfo',
	'house/estateList',
	'house/getMarket',
	'house/estateInfo',
]

const env = 'prod' // prod: 线上服务器， test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})
export default api
