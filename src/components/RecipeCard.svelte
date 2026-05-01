<script>
  import { createEventDispatcher } from 'svelte'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  
  function handleClick() {
    dispatch('view', recipe)
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
</script>

<div class="recipe-card" style="border-left: 4px solid {getCategoryBorder(recipe.category)}" on:click={handleClick}>
  <div class="card-header">
    <h3 class="recipe-name">{recipe.name}</h3>
    <span 
      class="category-tag"
      style="background: {getCategoryGradient(recipe.category)}"
    >
      {recipe.category || '未分类'}
    </span>
  </div>
  
  <div class="card-body">
    {#if recipe.description}
      <p class="description">{recipe.description}</p>
    {/if}
    
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
      <div class="info-item">
        <div class="info-badge step-badge">
          <span class="info-icon">📝</span>
          <span>{recipe.steps?.length || 0} 个步骤</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .recipe-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: 24px;
    cursor: pointer;
    transition: var(--transition);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
  }

  .recipe-name {
    margin: 0;
    font-size: 1.15rem;
    color: var(--text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
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

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
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

  .step-badge {
    background: linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%);
    color: var(--accent);
  }

  .info-icon {
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .recipe-card {
      padding: 18px;
    }
    
    .recipe-name {
      font-size: 1rem;
    }
    
    .recipe-info {
      gap: 8px;
    }
  }
</style>