# 静时 · Still Focus

一款自用的 iPad 学习时长记录 PWA。没有倒计时、没有账号、没有云同步，只记录真实投入的学习时间。

## 功能

- 按科目开始正计时，支持暂停、继续与结束保存
- 开始专注后自动进入沉浸式全屏计时
- 轻落、滑入、呼吸、静止 4 种数字动效可选
- 全屏默认只显示数字，轻点屏幕显示操作按钮
- 页面关闭或切到后台后，按真实时间恢复计时
- 手动补记、编辑和删除学习记录
- 今日、近 7 天、近 30 天学习时长统计
- 科目分布与近 12 周学习热力图
- 学习科目管理
- 本地 JSON 备份导出与恢复
- 可安装到 iPad 主屏幕并离线使用

## 本地开发

```bash
pnpm install
pnpm dev
```

## 验证

```bash
pnpm test
pnpm build
```

## 免费部署到 GitHub Pages

项目已包含 `.github/workflows/deploy.yml`，每次推送到 `master` 都会先运行测试和生产构建，再自动部署。

1. 在 GitHub 创建一个公开仓库并推送本项目。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
4. 等待 Actions 完成，访问部署地址。

## 安装到 iPad

1. 用 iPad Safari 打开 GitHub Pages 地址。
2. 点击分享按钮，选择“添加到主屏幕”。
3. 之后可从主屏幕全屏打开，并支持离线使用。

构建资源使用相对路径，GitHub Pages 的项目子路径也能正常加载。

## 数据说明

所有数据保存在当前浏览器的 IndexedDB 中，不会上传到服务器。清除 Safari 网站数据会删除记录，因此建议定期在“设置 → 数据备份”中导出 JSON 文件。
