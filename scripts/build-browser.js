#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 生成浏览器友好的UMD版本
 * 从ES Module版本转换为IIFE格式，避免exports依赖
 */
function buildBrowserVersion() {
  const esmPath = path.join(__dirname, '../dist/index.esm.js');
  const umdPath = path.join(__dirname, '../dist/index.umd.js');
  
  if (!fs.existsSync(esmPath)) {
    console.error('❌ ES Module文件不存在，请先运行构建');
    process.exit(1);
  }
  
  console.log('📦 正在生成浏览器版本...');
  
  // 读取ES Module内容
  const esmContent = fs.readFileSync(esmPath, 'utf8');
  
  // 移除export语句
  const codeWithoutExports = esmContent.replace(/export\s*\{[^}]*\}\s*;?/g, '');
  
  // 创建IIFE包装器
  const browserContent = `(function() {
  'use strict';
  
${codeWithoutExports}
  
  // 创建全局对象
  if (typeof window !== 'undefined') {
    window.BareToast = {
      toast: toast,
      default: toast
    };
  }
})();
`;

  // 写入UMD文件
  fs.writeFileSync(umdPath, browserContent);
  
  const sizeKB = (browserContent.length / 1024).toFixed(2);
  console.log(`✅ 浏览器版本已生成: dist/index.umd.js (${sizeKB}KB)`);
  console.log('🌐 可通过 <script src="./dist/index.umd.js"></script> 引入');
  console.log('📖 使用方式: const { toast } = BareToast;');
}

// 如果直接运行此脚本
if (require.main === module) {
  buildBrowserVersion();
}

module.exports = buildBrowserVersion;
