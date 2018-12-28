const roots = {
	prod: 'https://api.hd.xiaoyu.com/wxapp/fnzf/index/',
	dev: 'http://192.168.1.46/index.php/wxapp/fnzf/index/',
	test: 'https://hd-api.dev.xiaoyu.com/index.php/wxapp/fnzf/index/'
}
const apis = [
	// 普通用户
	'followList',
	'history',
	'houseList',
	'userId',
	'userInfo',
	'userMobile',
	'mobileLogin',
	'saveUser',
	'sendCode',
	'sendAgentCode',
	'houseInfo',
	'estateInfo',
	'estateList',
	// 经纪人
	'agentLogin',
	'agentHouses',
	'addHouses',
	'deleteHouses',
	'searchHouses',

]

const env = 'test' // dev: 本地测试服务器， prod：线上服务器, test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})

export default api
