# 🔑 Hướng Dẫn Lấy Token Để Publish VS Code Marketplace

## ⚠️ Token Hiện Tại Đã Hết Hạn

Bạn cần tạo Personal Access Token mới từ Azure DevOps.

## 📝 Các Bước Tạo Token

### 1. Truy Cập Azure DevOps
- Vào: https://dev.azure.com
- Đăng nhập với tài khoản Microsoft của bạn

### 2. Tạo Personal Access Token

1. Click vào **User Settings** (icon người ở góc trên bên phải)
2. Chọn **Personal Access Tokens**
3. Click **+ New Token**
4. Điền thông tin:
   - **Name**: `VS Code Marketplace Publish`
   - **Organization**: Chọn organization của bạn (hoặc All accessible organizations)
   - **Expiration**: Chọn thời hạn (khuyến nghị: 1 năm)
   - **Scopes**: 
     - ✅ Chọn **Custom defined**
     - ✅ Tìm và chọn **Marketplace (Manage)** - Full access
5. Click **Create**
6. **QUAN TRỌNG**: Copy token ngay (chỉ hiển thị 1 lần!)

### 3. Sử Dụng Token

Sau khi có token, chạy lệnh:

```bash
cd "D:\Extension\Project Time Tracker"
vsce publish -p <your-new-token>
```

Hoặc đăng nhập lại:
```bash
vsce login CodeClock
# Nhập token mới khi được hỏi
vsce publish
```

---

## ✅ Open VSX - Đã Publish Thành Công!

Extension đã được publish lên Open VSX:
- **URL**: https://open-vsx.org/extension/CodeClock/codeclock-time-tracker
- **Version**: 0.1.1
- **Status**: ✅ Published

---

## 🎯 Tóm Tắt

- ✅ **Open VSX**: Đã publish thành công
- ⏳ **VS Code Marketplace**: Cần token mới để publish

Sau khi có token mới, chỉ cần chạy:
```bash
vsce publish -p <your-token>
```

