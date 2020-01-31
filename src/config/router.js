import TxCodePage from '@/module/page/txcode/Container'
import LoginPage from '@/module/page/login/Container'
import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: TxCodePage
  },
  {
    path: '/home',
    page: TxCodePage
  },
  {
    path: '/txcode',
    page: TxCodePage
  },
  {
    path: '/login',
    page: LoginPage
  },
  {
    page: NotFound
  }
]
