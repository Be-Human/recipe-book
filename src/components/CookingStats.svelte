<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore, cookingHistoryStore, getCategories } from '../store/recipeStore.js'
  
  const dispatch = createEventDispatcher()
  
  function handleBack() {
    dispatch('back')
  }
  
  $: history = $cookingHistoryStore
  $: recipes = $recipeStore
  
  $: totalCooked = history.length
  $: uniqueRecipes = new Set(history.map(h => h.recipeId)).size
  
  $: mostCooked = calculateMostCooked(history, recipes)
  $: categoryStats = calculateCategoryStats(history, recipes)
  $: frequencyStats = calculateFrequency(history)
  $: recentActivity = calculateRecentActivity(history)
  
  function calculateMostCooked(historyList, recipeList) {
    const countMap = new Map()
    historyList.forEach(h => {
      countMap.set(h.recipeId, (countMap.get(h.recipeId) || 0) + 1)
    })
    
    const sorted = Array.from(countMap.entries())
      .map(([recipeId, count]) => {
        const recipe = recipeList.find(r => r.id === recipeId)
        return {
          recipeId,
          name: recipe?.name || '未知食谱',
          category: recipe?.category || '未分类',
          count
        }
      })
      .sort((a, b) => b.count - a.count)
    
    return sorted
  }
  
  function calculateCategoryStats(historyList, recipeList) {
    const categoryMap = new Map()
    historyList.forEach(h => {
      const recipe = recipeList.find(r => r.id === h.recipeId)
      const category = recipe?.category || '未分类'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })
    
    const total = historyList.length || 1
    const sorted = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    return sorted
  }
  
  function calculateFrequency(historyList) {
    if (historyList.length === 0) {
      return {
        weekly: 0,
        monthly: 0,
        average: '0'
      }
    }
    
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const weeklyCount = historyList.filter(h => new Date(h.cookedAt) >= oneWeekAgo).length
    const monthlyCount = historyList.filter(h => new Date(h.cookedAt) >= oneMonthAgo).length
    
    const firstCooked = new Date(historyList[historyList.length - 1]?.cookedAt || now)
    const daysSinceFirst = Math.max(1, Math.ceil((now - firstCooked) / (24 * 60 * 60 * 1000)))
    const weeklyAverage = (historyList.length / daysSinceFirst * 7).toFixed(1)
    
    return {
      weekly: weeklyCount,
      monthly: monthlyCount,
      average: weeklyAverage
    }
  }
  
  function calculateRecentActivity(historyList) {
    const now = new Date()
    const activity = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      
      const count = historyList.filter(h => {
        const cookedDate = new Date(h.cookedAt).toISOString().split('T')[0]
        return cookedDate === dateKey
      }).length
      
      activity.push({
        date: date,
        dateKey,
        dayName: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        count
      })
    }
    
    return activity
  }
  
  function getMaxCount() {
    return Math.max(...recentActivity.map(a => a.count), 1)
  }
  
  function getBarHeight(count) {
    const max = getMaxCount()
    return max === 0 ? 0 : (count / max) * 100
  }
  
  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) {
      return diffMins <= 1 ? '刚刚' : `${diffMins}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }
  }
</script>

<div class="cooking-stats">
  <div class="stats-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <h1 class="stats-title">📊 烹饪统计</h1>
  </div>

  {#if totalCooked === 0}
    <div class="empty-state">
      <span class="empty-icon">🍳</span>
      <p class="empty-message">还没有烹饪记录</p>
      <p class="empty-hint">打开食谱详情，点击"记录烹饪"开始记录您的烹饪历程</p>
    </div>
  {:else}
    <div class="stats-summary">
      <div class="summary-card">
        <span class="summary-icon">📊</span>
        <div class="summary-content">
          <span class="summary-value">{totalCooked}</span>
          <span class="summary-label">总烹饪次数</span>
        </div>
      </div>
      <div class="summary-card">
        <span class="summary-icon">🍽️</span>
        <div class="summary-content">
          <span class="summary-value">{uniqueRecipes}</span>
          <span class="summary-label">已尝试食谱</span>
        </div>
      </div>
      <div class="summary-card">
        <span class="summary-icon">📅</span>
        <div class="summary-content">
          <span class="summary-value">{frequencyStats.weekly}</span>
          <span class="summary-label">本周烹饪</span>
        </div>
      </div>
      <div class="summary-card">
        <span class="summary-icon">📈</span>
        <div class="summary-content">
          <span class="summary-value">{frequencyStats.average}</span>
          <span class="summary-label">周均烹饪</span>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <section class="stats-section">
        <h2 class="section-title">
          <span class="section-icon">🏆</span> 烹饪排行
        </h2>
        <div class="section-content">
          {#if mostCooked.length === 0}
            <div class="section-empty">暂无数据</div>
          {:else}
            <div class="ranked-list">
              {#each mostCooked.slice(0, 10) as item, index}
                <div class="ranked-item" class:top-three={index < 3}>
                  <span class="rank-number" class:gold={index === 0} class:silver={index === 1} class:bronze={index === 2}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                  <div class="ranked-info">
                    <span class="ranked-name">{item.name}</span>
                    <span class="ranked-category">{item.category}</span>
                  </div>
                  <span class="ranked-count">
                    {item.count} 次
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </section>

      <section class="stats-section">
        <h2 class="section-title">
          <span class="section-icon">📊</span> 分类占比
        </h2>
        <div class="section-content">
          {#if categoryStats.length === 0}
            <div class="section-empty">暂无数据</div>
          {:else}
            <div class="category-list">
              {#each categoryStats as stat}
                <div class="category-item">
                  <div class="category-header">
                    <span class="category-name">{stat.category}</span>
                    <span class="category-percentage">{stat.percentage}%</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      style="width: {stat.percentage}%;"
                    ></div>
                  </div>
                  <span class="category-count">{stat.count} 次</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </section>
    </div>

    <section class="stats-section full-width">
      <h2 class="section-title">
        <span class="section-icon">📅</span> 最近7天活动
      </h2>
      <div class="section-content">
        <div class="activity-chart">
          {#each recentActivity as activity}
            <div class="activity-bar-container" class:today={activity.dateKey === new Date().toISOString().split('T')[0]}>
              <div class="bar-wrapper">
                <div 
                  class="activity-bar"
                  style="height: {getBarHeight(activity.count)}%;"
                  class:has-activity={activity.count > 0}
                >
                  {#if activity.count > 0}
                    <span class="bar-label">{activity.count}</span>
                  {/if}
                </div>
              </div>
              <span class="bar-day">周{activity.dayName}</span>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="stats-section full-width">
      <h2 class="section-title">
        <span class="section-icon">🕐</span> 最近记录
      </h2>
      <div class="section-content">
        {#if history.length === 0}
          <div class="section-empty">暂无记录</div>
        {:else}
          <div class="recent-list">
            {#each history.slice(0, 10) as record}
              {@const recipe = recipes.find(r => r.id === record.recipeId)}
              <div class="recent-item">
                <div class="recent-info">
                  <span class="recent-name">{recipe?.name || '未知食谱'}</span>
                  {#if recipe?.category}
                    <span class="recent-category">{recipe.category}</span>
                  {/if}
                </div>
                <span class="recent-time">
                  {formatTime(record.cookedAt)}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .cooking-stats {
    width: 100%;
  }

  .stats-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .back-btn {
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    font-size: 0.95rem;
    cursor: pointer;
    padding: 10px 20px;
    transition: var(--transition);
    border-radius: var(--radius-md);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }

  .back-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateX(-3px);
  }

  .stats-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 60px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
  }

  .empty-message {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  .empty-hint {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .stats-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .summary-icon {
    font-size: 2rem;
  }

  .summary-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-value {
    color: var(--primary);
    font-size: 1.6rem;
    font-weight: 700;
  }

  .summary-label {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 24px;
  }

  .stats-section {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .stats-section.full-width {
    grid-column: 1 / -1;
  }

  .section-title {
    margin: 0;
    padding: 20px 24px;
    color: var(--text-primary);
    font-size: 1.15rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-icon {
    font-size: 1.4rem;
  }

  .section-content {
    padding: 20px 24px;
  }

  .section-empty {
    text-align: center;
    padding: 40px;
    color: var(--text-light);
    font-size: 0.95rem;
  }

  .ranked-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ranked-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    transition: var(--transition);
  }

  .ranked-item:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .ranked-item.top-three {
    background: linear-gradient(135deg, #FFF8F5 0%, #FFEDE6 100%);
  }

  .rank-number {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-secondary);
    background: var(--card-bg);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .rank-number.gold {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: white;
    font-size: 1.2rem;
  }

  .rank-number.silver {
    background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
    color: white;
    font-size: 1.1rem;
  }

  .rank-number.bronze {
    background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
    color: white;
    font-size: 1.1rem;
  }

  .ranked-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .ranked-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ranked-category {
    color: var(--text-light);
    font-size: 0.8rem;
  }

  .ranked-count {
    color: var(--primary);
    font-weight: 700;
    font-size: 0.95rem;
    white-space: nowrap;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .category-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .category-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .category-percentage {
    color: var(--primary);
    font-weight: 700;
    font-size: 1rem;
  }

  .progress-bar {
    height: 8px;
    background: var(--bg-gradient-1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 4px;
    transition: width 0.5s ease-out;
    min-width: 0;
  }

  .category-count {
    color: var(--text-light);
    font-size: 0.8rem;
  }

  .activity-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    gap: 12px;
    height: 200px;
    padding: 20px 0 10px 0;
  }

  .activity-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .activity-bar-container.today .bar-day {
    color: var(--primary);
    font-weight: 700;
  }

  .bar-wrapper {
    height: 160px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
  }

  .activity-bar {
    width: 40px;
    min-height: 4px;
    background: var(--border-color);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    position: relative;
    transition: height 0.3s ease-out;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .activity-bar.has-activity {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
  }

  .activity-bar-container.today .activity-bar.has-activity {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  }

  .bar-label {
    position: absolute;
    top: -24px;
    color: var(--primary);
    font-weight: 700;
    font-size: 0.85rem;
  }

  .bar-day {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    transition: var(--transition);
  }

  .recent-item:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .recent-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .recent-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-category {
    color: var(--secondary);
    font-size: 0.8rem;
    font-weight: 500;
    background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%);
    padding: 2px 10px;
    border-radius: 10px;
    width: fit-content;
  }

  .recent-time {
    color: var(--text-light);
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .stats-summary {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .stats-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .back-btn {
      text-align: center;
    }

    .stats-title {
      text-align: center;
      font-size: 1.3rem;
    }

    .stats-summary {
      grid-template-columns: 1fr;
    }

    .summary-card {
      padding: 16px 20px;
    }

    .section-title {
      padding: 16px 20px;
    }

    .section-content {
      padding: 16px 20px;
    }

    .ranked-item {
      flex-wrap: wrap;
      gap: 10px;
    }

    .ranked-info {
      min-width: 0;
    }

    .activity-chart {
      gap: 8px;
    }

    .activity-bar {
      width: 30px;
    }

    .recent-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .recent-time {
      align-self: flex-end;
    }
  }
</style>