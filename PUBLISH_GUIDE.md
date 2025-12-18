# Hướng Dẫn Publish Extension lên Marketplace

## ✅ Đã Hoàn Thành

1. ✅ Code đã được commit và push lên GitHub
2. ✅ Extension đã được package: `codeclock-time-tracker-0.1.1.vsix`
3. ✅ Documentation đã được cập nhật (README.md, CHANGELOG.md)

## 📦 File Sẵn Sàng Publish

- **VSIX Package**: `codeclock-time-tracker-0.1.1.vsix` (56.32 KB)
- **Version**: 0.1.1
- **GitHub**: https://github.com/babyfox1306/project-time-tracker.git

---

## 🚀 Publish lên VS Code Marketplace (Microsoft)

### Bước 1: Tạo Personal Access Token

1. Vào: https://dev.azure.com
2. Đăng nhập với tài khoản Microsoft
3. Vào **User Settings** → **Personal Access Tokens**
4. Tạo token mới:
   - **Name**: `VS Code Marketplace Publish`
   - **Organization**: Chọn organization của bạn
   - **Expiration**: Chọn thời hạn (khuyến nghị: 1 năm)
   - **Scopes**: Chọn **Marketplace (Manage)**
5. Copy token (chỉ hiển thị 1 lần!)

### Bước 2: Đăng nhập với vsce

```bash
cd "D:\Extension\Project Time Tracker"
vsce login CodeClock
```

Nhập Personal Access Token khi được hỏi.

### Bước 3: Publish

```bash
vsce publish
```

Hoặc publish từ file .vsix:
```bash
vsce publish -p <your-personal-access-token>
```

### Kiểm Tra

Sau khi publish thành công, extension sẽ có tại:
https://marketplace.visualstudio.com/items?itemName=CodeClock.codeclock-time-tracker

---

## 🌐 Publish lên Open VSX Registry

### Bước 1: Tạo Tài Khoản

1. Vào: https://open-vsx.org
2. Đăng ký/Đăng nhập với GitHub account
3. Vào **User Settings** → **Access Tokens**
4. Tạo token mới và copy

### Bước 2: Publish

```bash
cd "D:\Extension\Project Time Tracker"
ovsx publish codeclock-time-tracker-0.1.1.vsix -p <your-open-vsx-token>
```

Hoặc đăng nhập trước:
```bash
ovsx login
ovsx publish codeclock-time-tracker-0.1.1.vsix
```

### Kiểm Tra

Sau khi publish thành công, extension sẽ có tại:
https://open-vsx.org/extension/CodeClock/codeclock-time-tracker

---

## 📋 Checklist Trước Khi Publish

- [x] Code đã được test
- [x] TypeScript compile thành công
- [x] Package thành công (.vsix file)
- [x] README.md đã cập nhật
- [x] CHANGELOG.md đã cập nhật
- [x] Version number đúng (0.1.1)
- [x] GitHub repository đã push

---

## 🎯 Thông Số Extension

- **Publisher**: CodeClock
- **Extension ID**: CodeClock.codeclock-time-tracker
- **Version**: 0.1.1
- **Name**: codeclock-time-tracker
- **Display Name**: CodeClock Time Tracker
- **Repository**: https://github.com/babyfox1306/project-time-tracker.git

---

## ⚠️ Lưu Ý

1. **Version Number**: Không thể publish lại cùng version. Nếu cần update, tăng version trong `package.json`
2. **Review Process**: VS Code Marketplace có thể mất 1-2 ngày để review
3. **Open VSX**: Publish ngay, không cần review
4. **Personal Access Token**: Giữ bí mật, không commit vào Git

---

## 🎉 Sau Khi Publish

1. Kiểm tra extension trên marketplace
2. Test installation từ marketplace
3. Cập nhật README với link marketplace (nếu cần)
4. Thông báo cho users về update mới

---

**Chúc bạn publish thành công! 🚀**

