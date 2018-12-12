// 户型
const houseTypeArry = [
	['1室', '2室', '3室', '4室', '5室', '6室', '7室', '8室', '9室'],
	['0厅', '1厅', '2厅', '3厅', '4厅', '5厅', '6厅', '7厅', '8厅'],
	['0卫', '1卫', '2卫', '3卫', '4卫', '5卫', '6卫', '7卫', '8卫'],
]

// 朝向
const orientationArry = ['东', '南', '西', '北', '东南', '西南', '东北', '西北', '南北', '东西']

// 建筑类型
const buildingTypeArry = ['板楼', '塔楼', '板塔结合', '平房']

// 装修类型
const decoratioTypeArry = ['豪华装修', '精装', '简装', '毛培']

// 额外面积
const extraAreaArry = ['有', '无', '不清楚']

// 楼层
const storeyNum = []
const storeyAll = []
for (let i = 1; i <= 60; i++) {
	storeyNum.push(`${i}层`)
	storeyAll.push(`共${i}层`)
}
const storeyArry = [storeyNum, storeyAll]

// 城市列表
const hotCityArry = [
	{
		name: '厦门',
		code: '350200'
	},
	{
		name: '漳州',
		code: '350600'
	},
	{
		name: '泉州',
		code: '350500'
	},
]
const allCityArry = [
	{
		name: '福州',
		code: '350100'
	},
	{
		name: '厦门',
		code: '350200'
	},
	{
		name: '泉州',
		code: '350500'
	},
	{
		name: '莆田',
		code: '350300'
	},
	{
		name: '漳州',
		code: '350600'
	},
	{
		name: '三明',
		code: '350400'
	},
	{
		name: '南平',
		code: '350700'
	},
	{
		name: '龙岩',
		code: '350800'
	},
	{
		name: '宁德',
		code: '350900'
	},
]
module.exports = {
	houseTypeArry,
	orientationArry,
	storeyArry,
	buildingTypeArry,
	decoratioTypeArry,
	extraAreaArry,
	allCityArry,
	hotCityArry,
}
