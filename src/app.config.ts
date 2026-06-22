export default defineAppConfig({
  pages: [
    'pages/verify/index',
    'pages/appointment/index',
    'pages/records/index',
    'pages/workspace/index',
    'pages/coupon-detail/index',
    'pages/verify-confirm/index',
    'pages/verify-success/index',
    'pages/exception/index',
    'pages/shift-summary/index',
    'pages/appointment-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '医美卡券核销',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1677FF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/verify/index',
        text: '核销'
      },
      {
        pagePath: 'pages/appointment/index',
        text: '预约'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/workspace/index',
        text: '工作台'
      }
    ]
  }
})
