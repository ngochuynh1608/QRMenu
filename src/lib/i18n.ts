export type UiMessages = {
  restaurants: string;
  scanToView: string;
  tapOrScan: string;
  viewMenu: string;
  viewInfo: string;
  downloadQr: string;
  printQr: string;
  printAll: string;
  call: string;
  hours: string;
  address: string;
  featured: string;
  soldOut: string;
  noItems: string;
  language: string;
  admin: string;
  close: string;
  backHome: string;
  venueQsr: string;
  venueHotel: string;
};

export const UI_MESSAGES: Record<string, UiMessages> = {
  vi: {
    restaurants: "Chọn dịch vụ",
    scanToView: "Quét mã để xem menu",
    tapOrScan: "Chạm vào dịch vụ hoặc quét mã QR",
    viewMenu: "Xem menu",
    viewInfo: "Xem thông tin",
    downloadQr: "Tải QR",
    printQr: "In QR",
    printAll: "In tất cả",
    call: "Gọi điện",
    hours: "Giờ mở cửa",
    address: "Địa chỉ",
    featured: "Nổi bật",
    soldOut: "Hết món",
    noItems: "Nội dung đang được cập nhật",
    language: "Ngôn ngữ",
    admin: "Quản trị",
    close: "Đóng",
    backHome: "Quay lại",
    venueQsr: "Nhà hàng phục vụ nhanh",
    venueHotel: "Khách sạn",
  },
  en: {
    restaurants: "Choose a service",
    scanToView: "Scan to view the menu",
    tapOrScan: "Tap a service or scan its QR code",
    viewMenu: "View menu",
    viewInfo: "View details",
    downloadQr: "Download QR",
    printQr: "Print QR",
    printAll: "Print all",
    call: "Call",
    hours: "Hours",
    address: "Address",
    featured: "Featured",
    soldOut: "Sold out",
    noItems: "Content is being updated",
    language: "Language",
    admin: "Admin",
    close: "Close",
    backHome: "Back",
    venueQsr: "Quick Service Restaurant",
    venueHotel: "Hotel",
  },
  ja: {
    restaurants: "サービスを選ぶ",
    scanToView: "QRをスキャンしてメニューを見る",
    tapOrScan: "サービスをタップ、またはQRをスキャン",
    viewMenu: "メニュー",
    viewInfo: "詳細",
    downloadQr: "QRを保存",
    printQr: "QRを印刷",
    printAll: "すべて印刷",
    call: "電話",
    hours: "営業時間",
    address: "住所",
    featured: "おすすめ",
    soldOut: "売り切れ",
    noItems: "準備中",
    language: "言語",
    admin: "管理",
    close: "閉じる",
    backHome: "戻る",
    venueQsr: "Quick Service Restaurant",
    venueHotel: "Hotel",
  },
  ko: {
    restaurants: "서비스 선택",
    scanToView: "QR을 스캔해 메뉴를 보세요",
    tapOrScan: "서비스를 터치하거나 QR을 스캔하세요",
    viewMenu: "메뉴 보기",
    viewInfo: "자세히 보기",
    downloadQr: "QR 저장",
    printQr: "QR 인쇄",
    printAll: "모두 인쇄",
    call: "전화",
    hours: "영업시간",
    address: "주소",
    featured: "추천",
    soldOut: "품절",
    noItems: "준비 중",
    language: "언어",
    admin: "관리",
    close: "닫기",
    backHome: "뒤로",
    venueQsr: "Quick Service Restaurant",
    venueHotel: "Hotel",
  },
  zh: {
    restaurants: "选择服务",
    scanToView: "扫码查看菜单",
    tapOrScan: "点击服务或扫描二维码",
    viewMenu: "查看菜单",
    viewInfo: "查看详情",
    downloadQr: "下载二维码",
    printQr: "打印二维码",
    printAll: "全部打印",
    call: "电话",
    hours: "营业时间",
    address: "地址",
    featured: "推荐",
    soldOut: "售罄",
    noItems: "内容更新中",
    language: "语言",
    admin: "后台",
    close: "关闭",
    backHome: "返回",
    venueQsr: "Quick Service Restaurant",
    venueHotel: "Hotel",
  },
};

export function getUiMessages(locale: string): UiMessages {
  return UI_MESSAGES[locale] || UI_MESSAGES.en;
}
