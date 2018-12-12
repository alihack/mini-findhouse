const roots = {
	prod: 'https://api.hd.xiaoyu.com/wxapp/fngj/index/',
	dev: 'http://192.168.1.46/index.php/wxapp/fngj/index/',
	test: 'https://hd-api.dev.xiaoyu.com/index.php/wxapp/fngj/index/'
}
const apis = [
	'getUserId',
	'saveUser',
	'getUserInfo',
	'getEvaluationHistory',
	'getCommunityList',
	'getHousePrice',
	'addHouseInfo',
	'sendCode',
	'mobileLogin',
	'addUserIntention',
	'getUserMobile',
	'getTrend',
	'isSubscribe',
	'getSearchHistory'
]

const env = 'test' // dev: 本地测试服务器， prod：线上服务器, test：测试服务器
const root = roots[env]
const api = {}
apis.forEach(ele => {
	api[ele] = root + ele
})

export default api
