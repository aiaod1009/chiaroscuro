# Chiaroscuro API 接口文档

## 目录

- [Photos 照片相关](#photos-照片相关)
  - [查询类](#查询类)
  - [操作类](#操作类)
  - [上传类](#上传类)
- [Works 作品集相关](#works-作品集相关)
- [AI 智能生成](#ai-智能生成)
- [COS 对象存储](#cos-对象存储)

---

## Photos 照片相关

### 查询类

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/photos/drafts` | 获取草稿箱列表 |
| GET | `/api/photos/footprints` | 足迹地图数据（按地区聚合） |
| GET | `/api/photos/gallery/:mapCode` | 画廊详情（分页） |
| GET | `/api/photos/:id` | 获取单张照片详情 |

#### GET `/api/photos/drafts`

获取所有草稿状态的照片，按创建时间倒序。

**响应：**
```json
{
  "success": true,
  "data": [{ "_id", "imageUrl", "fileName", "isDraft", ... }]
}
```

#### GET `/api/photos/footprints`

按地区聚合照片，用于足迹地图展示。

**响应：**
```json
{
  "success": true,
  "data": [{
    "region": "CN-11",
    "locationName": "北京",
    "photoCount": 12,
    "albumCount": 2,
    "photos": [{ "src", "alt" }],
    "mapCode": "CN-11"
  }]
}
```

#### GET `/api/photos/gallery/:mapCode`

按地区获取照片列表，支持分页。

**参数：**
- `mapCode` - 地区代码（如 `CN-11`、`JP`）
- `page` - 页码（默认 1）
- `limit` - 每页数量（默认 20，最大 50）

**响应：**
```json
{
  "success": true,
  "data": {
    "title": "北京",
    "mapCode": "CN-11",
    "total": 50,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "photos": [{ "id", "src", "alt", "exif", "title", "caption", "createdAt" }]
  }
}
```

#### GET `/api/photos/:id`

获取单张照片详情，包含完整 EXIF 信息。

**响应：**
```json
{
  "success": true,
  "data": { "_id", "imageUrl", "fileName", "exif", "title", "caption", ... }
}
```

---

### 操作类

| 方法 | 路径 | 说明 |
|------|------|------|
| PATCH | `/api/photos/:id/remove-album` | 从作品集移除照片 |
| PATCH | `/api/photos/:id/move` | 移动照片到其他作品集 |
| PATCH | `/api/photos/:id/copy` | 复制照片到其他作品集 |
| PATCH | `/api/photos/:id` | 更新照片标题与配文 |
| DELETE | `/api/photos/:id` | 删除照片 |

#### PATCH `/api/photos/:id/remove-album`

从指定作品集移除照片（不删除照片本身）。

**请求体：**
```json
{ "albumId": "作品集ID" }
```

#### PATCH `/api/photos/:id/move`

移动照片到其他作品集（替换 albumIds）。

**请求体：**
```json
{ "targetAlbumId": "目标作品集ID" }
```

#### PATCH `/api/photos/:id/copy`

复制照片到其他作品集（追加 albumId）。

**请求体：**
```json
{ "targetAlbumId": "目标作品集ID" }
```

#### PATCH `/api/photos/:id`

更新照片标题与配文。

**请求体：**
```json
{ "title": "新标题", "caption": "新配文" }
```

#### DELETE `/api/photos/:id`

删除照片，同时清理腾讯云 COS 上的文件。

---

### 上传类

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/photos/upload-raw` | 上传 WebP 草稿 |
| POST | `/api/photos/upload-master` | 上传成片（调色版） |

#### POST `/api/photos/upload-raw`

上传 WebP 草稿，支持 EXIF 信息。

**请求体：**
```json
{
  "imageUrl": "图片URL",
  "fileName": "文件名",
  "locationName": "地点名称",
  "region": "地区代码",
  "exif": { "camera", "lens", "aperture", "iso", "shutterSpeed", "focalLength", "dateTimeOriginal" },
  "selectedAlbumId": "作品集ID（可选）"
}
```

#### POST `/api/photos/upload-master`

上传成片，绑定到原图母体。

**请求体（FormData）：**
- `photo` - 文件
- `parentId` - 原图母体 ID
- `versionName` - 版本名称

---

## Works 作品集相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/works` | 获取全部作品集 |
| GET | `/api/works/travel` | 获取旅游相册列表 |
| GET | `/api/works/:id` | 获取单个作品集详情 |
| POST | `/api/works` | 创建作品集 |
| PATCH | `/api/works/:id` | 更新作品集 |
| DELETE | `/api/works/:id` | 删除作品集 |

#### GET `/api/works`

获取全部作品集，按真实时间倒序，自动补全封面。

**响应：**
```json
{
  "success": true,
  "data": [{ "_id", "name", "description", "coverImage", "realDate", ... }]
}
```

#### GET `/api/works/travel`

获取标记为旅游的相册列表。

#### GET `/api/works/:id`

获取单个作品集详情及其关联的照片。

**响应：**
```json
{
  "success": true,
  "data": { "_id", "name", "description", "photos": [...] }
}
```

#### POST `/api/works`

创建新作品集。

**请求体：**
```json
{
  "name": "作品集名称（必填）",
  "description": "描述",
  "realDate": "真实日期",
  "coverImage": "封面图URL"
}
```

#### PATCH `/api/works/:id`

更新作品集信息。

#### DELETE `/api/works/:id`

删除作品集。

---

## AI 智能生成

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai/inspire/session` | 查询历史会话 |
| POST | `/api/ai/inspire/first-round` | 首次生成（3个备选方案） |
| POST | `/api/ai/inspire/iterate` | 多轮迭代优化 |

#### GET `/api/ai/inspire/session`

查询历史 AI 会话，不触发生成。

**参数：**
- `photoId` - 照片 ID
- `style` - 风格（诗意/叙事/极简）

**响应：**
```json
{
  "success": true,
  "sessionId": "会话ID",
  "candidates": [{ "optionId", "title", "caption" }]
}
```

#### POST `/api/ai/inspire/first-round`

首次触发 AI 生成，返回 3 个备选方案。

**请求体：**
```json
{
  "photoId": "照片ID",
  "imageUrl": "图片URL",
  "style": "诗意"
}
```

**响应：**
```json
{
  "success": true,
  "sessionId": "会话ID",
  "chosenStyle": "诗意",
  "candidates": [
    { "optionId": 1, "title": "标题", "caption": "配文" },
    { "optionId": 2, "title": "标题", "caption": "配文" },
    { "optionId": 3, "title": "标题", "caption": "配文" }
  ]
}
```

#### POST `/api/ai/inspire/iterate`

多轮迭代优化，根据用户反馈微调文案。

**请求体：**
```json
{
  "sessionId": "会话ID",
  "optionId": 1,
  "currentContent": { "title": "当前标题", "caption": "当前配文" },
  "userFeedback": "用户修改意见"
}
```

**响应：**
```json
{
  "success": true,
  "updatedCandidate": { "optionId": 1, "title": "新标题", "caption": "新配文" }
}
```

---

## COS 对象存储

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cos/sts` | 获取临时上传凭证 |

#### GET `/api/cos/sts`

为前端生成直传 COS 的临时凭证（有效期 30 分钟）。

**响应：**
```json
{
  "success": true,
  "tmpSecretId": "临时密钥ID",
  "tmpSecretKey": "临时密钥",
  "sessionToken": "会话令牌",
  "startTime": 1234567890,
  "expiredTime": 1234569690,
  "bucket": "存储桶名称",
  "region": "ap-guangzhou"
}
```
