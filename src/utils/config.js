// 地图周边配套
const supportArry = [{
		title: '餐饮',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-dinner.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-dinner.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-dinner.png'
	},
	{
		title: '学校',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-school.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-school.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-school.png'
	},
	{
		title: '地铁',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-subway.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-subway.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-subway.png'
	},
	{
		title: '公交',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-bus.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-bus.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-bus.png'
	},
	{
		title: '娱乐',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-game.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-game.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-game.png'
	},
	{
		title: '医院',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-hospital.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-hospital.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-hospital.png'
	},
	{
		title: '银行',
		isSelected: false,
		whiteIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/white-bank.png',
		blueIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/blue-bank.png',
		markerIcon: 'http://qimg.fangzi.xiaoyu.com/fangniu/marker-bank.png'
	}]

// 排序工具栏
const sortData = [{
			title: '区域',
			isSelected: false,
			kinds: [
				{value: '湖里区', isKindSelected: false},
				{value: '思明区', isKindSelected: false},
				{value: '集美区', isKindSelected: false},
				{value: '海沧区', isKindSelected: false},
				{value: '翔安区', isKindSelected: false},
				{value: '同安区', isKindSelected: false},
			]
		},
		{
			title: '总价',
			isSelected: false,
			kinds: [
				{value: '100万以下', isKindSelected: false},
				{value: '100-200万', isKindSelected: false},
				{value: '200-300万', isKindSelected: false},
				{value: '300-400万', isKindSelected: false},
				{value: '400-500万', isKindSelected: false},
				{value: '500-800万', isKindSelected: false},
				{value: '800万以上', isKindSelected: false},
			]
		},
		{
			title: '户型',
			isSelected: false,
			kinds: [
				{value: '一室', isKindSelected: false},
				{value: '二室', isKindSelected: false},
				{value: '三室', isKindSelected: false},
				{value: '四室', isKindSelected: false},
				{value: '五室', isKindSelected: false},
				{value: '五室以上', isKindSelected: false},
			]
		},
		{
			title: '更多',
			isSelected: false,
			type: [
				{
					title: '面积',
					kinds: [
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
