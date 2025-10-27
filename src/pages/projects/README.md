# 📦 Projects Module

Bu klasör **Project** ile ilgili tüm sayfaları ve bileşenleri içerir.

## 📂 Yapı

```
projects/
├── ProjectsListPage.tsx      # Proje listesi (Ana sayfa)
├── ProjectDetailPage.tsx     # Proje detay ve düzenleme
├── ProjectDataPage.tsx       # Proje data yönetimi
│
├── components/               # Proje özel bileşenler
│   └── (boş - ileride eklenecek)
│
└── README.md                 # Bu dosya
```

## 🎯 Sayfalar

### ProjectsListPage.tsx
**Route:** `/projects`

- Kullanıcının tüm projelerini listeler
- Yeni proje oluşturma formu
- Proje arama ve filtreleme
- Project card'ları (name, description, table count, creation date)
- API Key görüntüleme/kopyalama
- Proje silme (confirm modal ile)

**Özellikler:**
- Grid layout (responsive)
- Create project modal
- Delete confirmation
- API Key visibility toggle
- Direct navigation to project detail and data pages

---

### ProjectDetailPage.tsx
**Route:** `/projects/:projectId`

- Proje detay bilgileri
- Tab-based interface:
  - **Tables Tab**: Tablo yönetimi (TablePanel + FieldPanel)
  - **API Tab**: API Key bilgileri (ApiKeyDisplay component)
  - **Settings Tab**: Proje ayarları (ileride)

**Özellikler:**
- Dynamic project loading from context
- Breadcrumb navigation
- Tab switching
- Integrated table/field management

---

### ProjectDataPage.tsx
**Route:** `/projects/:projectId/data`

- Proje içindeki table data'larını görüntüleme
- Table selection dropdown
- Data table view (Excel-like)
- CRUD operations (ileride)

**Özellikler:**
- Table dropdown selector
- Mock data display (backend entegrasyonu sonrası gerçek data)
- Responsive table layout
- Back to project navigation

---

## 🔮 Gelecek Özellikler

Aşağıdaki sayfalar/özellikler eklenecek:

### Yeni Sayfalar
- `ProjectTablesPage.tsx` - Gelişmiş tablo yönetimi
- `ProjectApiKeysPage.tsx` - Multiple API key yönetimi
- `ProjectSettingsPage.tsx` - Proje ayarları
- `ProjectAnalyticsPage.tsx` - Proje istatistikleri
- `ProjectTeamPage.tsx` - Ekip yönetimi (ileride)
- `ProjectBackupPage.tsx` - Backup/Restore (ileride)
- `ProjectLogsPage.tsx` - Activity logs (ileride)
- `ProjectWebhooksPage.tsx` - Webhook yönetimi (ileride)
- `ProjectBillingPage.tsx` - Fatura/kullanım (ileride)

### Yeni Components
- `components/ProjectCard.tsx` - Proje kartı bileşeni
- `components/ProjectHeader.tsx` - Proje başlık bileşeni
- `components/DataTable.tsx` - Data table bileşeni
- `components/ApiKeyManager.tsx` - API key yönetimi bileşeni
- `components/TableBuilder.tsx` - Table builder bileşeni
- `components/ProjectSidebar.tsx` - Proje sidebar bileşeni

---

## 🔐 Role-Based Access

Tüm project sayfaları **ProtectedRoute** ile korunur.

**Kullanıcı Rolleri:**
- **customer/user**: Sadece kendi projelerini görebilir
- **admin**: Tenant'ındaki tüm projeleri görebilir
- **master_admin**: Tüm tenant'ların projelerini görebilir

---

## 🚀 Backend Integration

**Mevcut:** Local state management (DatabaseContext)

**Planlanan:**
```typescript
// Backend endpoints
GET    /api/v1/projects              // List projects
POST   /api/v1/projects              // Create project
GET    /api/v1/projects/:id          // Get project
PUT    /api/v1/projects/:id          // Update project
DELETE /api/v1/projects/:id          // Delete project
GET    /api/v1/projects/:id/tables   // Get project tables
POST   /api/v1/projects/:id/api-keys // Generate API key
```

---

## 📝 Notlar

- Bu modül tüm roller tarafından kullanılır (customer, admin, master-admin)
- Proje yapısı geniş ve modüler olacak şekilde tasarlandı
- Her özellik için ayrı sayfa oluşturulacak (Single Responsibility)
- Component'ler `components/` klasöründe toplanacak

---

**Oluşturulma Tarihi:** 27 Ekim 2025  
**Son Güncelleme:** 27 Ekim 2025

