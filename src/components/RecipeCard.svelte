<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore } from '../store/recipeStore.js'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  
  function handleView() {
    dispatch('view', recipe)
  }
  
  function toggleFavorite(event) {
    event.stopPropagation()
    event.preventDefault()
    recipeStore.toggleFavorite(recipe.id)
  }
  
  function getCategoryGradient(category) {
    const gradients = {
      '中式料理': 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
      '西式料理': 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      '日式料理': 'linear-gradient(135deg, #FFB703 0%, #FB8500 100%)',
      '韩式料理': 'linear-gradient(135deg, #A8E6CF 0%, #88D8B0 100%)',
      '甜点': 'linear-gradient(135deg, #FFAFBD 0%, #FFC3A0 100%)',
      '汤品': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      '主食': 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      '其他': 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)'
    }
    return gradients[category] || gradients['其他']
  }
  
  function getCategoryBorder(category) {
    const borders = {
      '中式料理': '#FF6B35',
      '西式料理': '#4ECDC4',
      '日式料理': '#FFB703',
      '韩式料理': '#88D8B0',
      '甜点': '#FFC3A0',
      '汤品': '#74b9ff',
      '主食': '#a29bfe',
      '其他': '#b2bec3'
    }
    return borders[category] || borders['其他']
  }
  
  function getDifficultyColor(difficulty) {
    const colors = {
      '简单': '#52c41a',
      '中等': '#faad14',
      '困难': '#ff4d4f'
    }
    return colors[difficulty] || colors['中等']
  }
</script>

<div 
  class="recipe-card" 
  style="border-left: 4px solid {getCategoryBorder(recipe.category)}"
>
  {#if recipe.coverImage}
    <button 
      class="cover-image-container view-btn"
      on:click={handleView}
      aria-label="查看 {recipe.name} 详情"
    >
      <img src={recipe.coverImage} alt={recipe.name} class="cover-image" />
    </button>
  {/if}
  
  <div class="card-header">
    <button 
      class="recipe-name-btn view-btn"
      on:click={handleView}
      aria-label="查看 {recipe.name} 详情"
    >
      <h3 class="recipe-name">{recipe.name}</h3>
    </button>
    <div class="header-actions">
      <span 
        class="category-tag"
        style="background: {getCategoryGradient(recipe.category)}"
      >
        {recipe.category || '未分类'}
      </span>
      <button 
        class="favorite-btn {recipe.isFavorite ? 'active' : ''}"
        on:click={toggleFavorite}
        title={recipe.isFavorite ? '取消收藏' : '添加收藏'}
        aria-label={recipe.isFavorite ? '取消收藏' : '添加收藏'}
      >
        {recipe.isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  </div>
  
  <div class="card-body">
    {#if recipe.description}
      <button 
        class="description-btn view-btn"
        on:click={handleView}
        aria-label="查看 {recipe.name} 详情"
      >
        <p class="description">{recipe.description}</p>
      </button>
    {/if}
    
    <button 
      class="info-btn view-btn"
      on:click={handleView}
      aria-label="查看 {recipe.name} 详情"
    >
      <div class="recipe-info">
        <div class="info-item">
          <div class="info-badge time-badge">
            <span class="info-icon">⏱️</span>
            <span>{recipe.cookingTime || '未知'} 分钟</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-badge ingredient-badge">
            <span class="info-icon">🥗</span>
            <span>{recipe.ingredients?.length || 0} 种食材</span>
          </div>
        </div>
        {#if recipe.difficulty}
          <div class="info-item">
            <div class="info-badge difficulty-badge" style="border-color: {getDifficultyColor(recipe.difficulty)}">
              <span class="info-icon">📊</span>
              <span style="color: {getDifficultyColor(recipe.difficulty)}">{recipe.difficulty}</span>
            </div>
          </div>
        {/if}
        {#if recipe.servings}
          <div class="info-item">
            <div class="info-badge serving-badge">
              <span class="info-icon">👥</span>
              <span>{recipe.servings} 人份</span>
            </div>
          </div>
        {/if}
      </div>
    </button>
  </div>
</div>

<style>
  .recipe-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: var(--transition);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    padding-top: 24px;
  }

  .cover-image-container {
    width: 100%;
    height: 180px;
    overflow: hidden;
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
    margin-top: -24px;
    margin-bottom: 16px;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition);
  }

  .recipe-card:hover .cover-image {
    transform: scale(1.05);
  }

  .recipe-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary) 0%, transparent 100%);
    opacity: 0;
    transition: var(--transition);
  }

  .recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .recipe-card:hover::before {
    opacity: 1;
  }

  .view-btn {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    text-align: left;
    font: inherit;
    width: 100%;
  }

  .view-btn:focus {
    outline: none;
  }

  .view-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
    padding: 0 24px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .recipe-name-btn {
    flex: 1;
    min-width: 0;
  }

  .recipe-name {
    margin: 0;
    font-size: 1.15rem;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    text-align: left;
  }

  .category-tag {
    padding: 5px 14px;
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .favorite-btn {
    background: none;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: var(--transition);
    line-height: 1;
  }

  .favorite-btn:hover {
    transform: scale(1.2);
  }

  .favorite-btn.active {
    animation: pulse 0.3s ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 24px 24px 24px;
  }

  .description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0 0 16px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }

  .recipe-info {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .info-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .time-badge {
    background: linear-gradient(135deg, #FFF5EB 0%, #FFE5D9 100%);
    color: var(--primary-dark);
  }

  .ingredient-badge {
    background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%);
    color: var(--secondary);
  }

  .difficulty-badge {
    background: linear-gradient(135deg, #FFF 0%, #FFF5EB 100%);
    border: 1px solid;
  }

  .serving-badge {
    background: linear-gradient(135deg, #F9F0FF 0%, #F3E8FF 100%);
    color: #6c5ce7;
  }

  .info-icon {
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .recipe-card {
      padding: 0;
    }
    
    .card-header {
      padding: 16px;
    }
    
    .card-body {
      padding: 0 16px 16px 16px;
    }
    
    .cover-image-container {
      height: 150px;
    }
    
    .recipe-name {
      font-size: 1rem;
    }
    
    .recipe-info {
      gap: 8px;
    }
  }
</style>