// 地图周边配套
const supportArry = [{
		title: '餐饮',
		isSelected: false,
		whiteIcon: '../images/white-dinner.png',
		blueIcon: '../images/blue-dinner.png',
		markerIcon: '../images/marker-dinner.png'
	},
	{
		title: '学校',
		isSelected: false,
		whiteIcon: '../images/white-school.png',
		blueIcon: '../images/blue-school.png',
		markerIcon: '../images/marker-school.png'
	},
	{
		title: '地铁',
		isSelected: false,
		whiteIcon: '../images/white-subway.png',
		blueIcon: '../images/blue-subway.png',
		markerIcon: '../images/marker-subway.png'
	},
	{
		title: '公交',
		isSelected: false,
		whiteIcon: '../images/white-bus.png',
		blueIcon: '../images/blue-bus.png',
		markerIcon: '../images/marker-bus.png'
	},
	{
		title: '娱乐',
		isSelected: false,
		whiteIcon: '../images/white-game.png',
		blueIcon: '../images/blue-game.png',
		markerIcon: '../images/marker-game.png'
	},
	{
		title: '医院',
		isSelected: false,
		whiteIcon: '../images/white-hospital.png',
		blueIcon: '../images/blue-hospital.png',
		markerIcon: '../images/marker-hospital.png'
	},
	{
		title: '银行',
		isSelected: false,
		whiteIcon: '../images/white-bank.png',
		blueIcon: '../images/blue-bank.png',
		markerIcon: '../images/marker-bank.png'
	}]

// 排序工具栏
const sortData = [{
			title: '区域',
			isSelected: false,
			kinds: ['不限', '湖里区', '集美区', '海沧区', '翔安区', '同安区']
		},
		{
			title: '总价',
			isSelected: false,
			kinds: ['不限', '100万以下', '100-200万', '200-300万', '300-400万', '400-500万', '500-800万', '800万以上']
		},
		{
			title: '户型',
			isSelected: false,
			kinds: ['不限', '一室', '二室', '三室', '四室', '五室', '五室以上']
		},
		{
			title: '更多',
			isSelected: false,
			type: [
				{
					title: '面积',
					kinds: [
						{value: '不限', isKindSelected: false},
						{value: '50平以下', isKindSelected: false},
						{value: '50-70平', isKindSelected: false},
						{value: '70-90平', isKindSelected: false},
						{value: '90-110平', isKindSelected: false},
						{value: '110-130平', isKindSelected: false},
						{value: '130-150平', isKindSelected: false},
						{value: '150-200平', isKindSelected: false},
						{value: '200平以上', isKindSelected: false}
					]
				},
					{
						title: '朝向',
						kinds: [
							{value: '不限', isKindSelected: false},
							{value: '朝东', isKindSelected: false},
							{value: '朝南', isKindSelected: false},
							{value: '朝西', isKindSelected: false},
							{value: '朝北', isKindSelected: false},
							{value: '南北', isKindSelected: false}
						]
				}
			]
		}
	]
module.exports = {
	supportArry,
	sortData
}
