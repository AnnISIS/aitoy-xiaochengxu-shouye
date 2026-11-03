function generateCirclePosition(centerX, centerY, radius, minDistance, existingPositions = [], maxAttempts = 100) {
    let attempts = 0;

    // y坐标边界限制（避免与顶部导航栏和底部按钮冲突）
    const minY = 18; // 顶部导航栏下方，留出球球半径(9vw) + 导航栏空间
    const maxY = 120; // 底部按钮上方，留出足够空间（开启偶遇按钮约在115vw左右）
  
    // 尝试生成满足条件的位置
    while (attempts < maxAttempts) {
      const angle = Math.random() * Math.PI * 2;
      const newPos = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
      
      // 检查 y 坐标是否在有效范围内
      if (newPos.y < minY || newPos.y > maxY) {
        attempts++;
        continue; // y 坐标超出范围，重新生成
      }
      
      // 检查与所有现有位置的距离
      let isValidPosition = true;
      for (const pos of existingPositions) {
        const dx = pos.x - newPos.x;
        const dy = pos.y - newPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          isValidPosition = false;
          break;
        }
      }
      
      if (isValidPosition) {
        return newPos;
      }
      
      attempts++;
    }
    
    console.warn(`无法在 ${maxAttempts} 次尝试内找到满足条件的位置`);
    return null;
  }
  
  const center = { x: 36, y: 74 }; // 与大球球中心对齐
  const Closeradius = 35; // 近距离球球（0-20米），离中心较近
  const CloseminDistance = 11;

  // 近距离生成10个不重复的位置
  export const ClosePosition = [];

  for (let i = 0; i < 10; i++) {
    const pos = generateCirclePosition(center.x, center.y, Closeradius, CloseminDistance, ClosePosition);
    if (pos) {
      ClosePosition.push(pos);
    } 
  }

  const Farradius = 48; // 远距离球球（20-100米），离中心较远
  const FarminDistance = 12;
  // 远距离生成15个不重复的位置
  export const FarPosition = [];
  for (let i = 0; i < 15; i++) {
    const pos = generateCirclePosition(center.x, center.y, Farradius, FarminDistance, FarPosition);
    if (pos) {
      FarPosition.push(pos);
    } 
  }
