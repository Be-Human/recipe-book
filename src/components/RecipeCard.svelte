<script>
  import { createEventDispatcher } from 'svelte'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  
  function handleClick() {
    dispatch('view', recipe)
  }
  
  function getCategoryColor(category) {
    const colors = {
      '中式料理': '#e74c3c',
      '西式料理': '#3498db',
      '日式料理': '#2ecc71',
      '韩式料理': '#9b59b6',
      '甜点': '#e91e63',
      '汤品': '#00bcd4',
      '主食': '#ff9800',
      '其他': '#607d8b'
    }
    return colors[category] || colors['其他']
  }
</script>

<div class="recipe-card" on:click={handleClick}>
  <div class="card-header">
    <h3 class="recipe-name">{recipe.name}</h3>
    <span 
      class="category-tag"
      style="background-color: {getCategoryColor(recipe.category)}"
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
        <span class="info-icon">⏱️</span>
        <span>{recipe.cookingTime || '未知'} 分钟</span>
      </div>
      <div class="info-item">
        <span class="info-icon">🥗</span>
        <span>{recipe.ingredients?.length || 0} 种食材</span>
      </div>
      <div class="info-item">
        <span class="info-icon">📝</span>
        <span>{recipe.steps?.length || 0} 个步骤</span>
      </div>
    </div>
  </div>
</div>

<style>
  .recipe-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .recipe-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    gap: 10px;
  }

  .recipe-name {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-tag {
    padding: 4px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    white-space: nowrap;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .description {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0 0 15px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recipe-info {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  .info-icon {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .recipe-card {
      padding: 15px;
    }
    
    .recipe-name {
      font-size: 1rem;
    }
    
    .recipe-info {
      gap: 10px;
    }
  }
</style>