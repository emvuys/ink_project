# Firebase模拟器启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INK NFS Firebase 模拟器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "firebase.json")) {
    Write-Host "错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查functions目录是否存在
if (-not (Test-Path "functions")) {
    Write-Host "错误: functions目录不存在" -ForegroundColor Red
    exit 1
}

# 检查是否安装了依赖
if (-not (Test-Path "functions/node_modules")) {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
    Write-Host "依赖安装完成" -ForegroundColor Green
}

# 检查Firebase CLI
Write-Host "检查Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 未安装Firebase CLI" -ForegroundColor Red
    Write-Host "请运行: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "Firebase CLI版本: $firebaseVersion" -ForegroundColor Green

Write-Host ""
Write-Host "启动Firebase模拟器..." -ForegroundColor Yellow
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  - Functions: http://localhost:5001" -ForegroundColor White
Write-Host "  - Firestore: http://localhost:8080" -ForegroundColor White
Write-Host "  - Firebase UI: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "按 Ctrl+C 停止模拟器" -ForegroundColor Yellow
Write-Host ""

# 启动模拟器
firebase emulators:start

