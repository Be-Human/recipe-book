<script>
  import { createEventDispatcher } from 'svelte'
  import RecipeCard from './RecipeCard.svelte'
  import { recipeStore, getCategories, filterRecipes } from '../store/recipeStore.js'
  
  let searchKeyword = ''
  let selectedCategory = 'all'
  
  $: filteredRecipes = filterRecipes($recipeStore, searchKeyword, selectedCategory)
  $: categories = ['all', ...getCategories($recipeStore)]
  
  const dispatch = createEventDispatcher()
  
  function handleView(recipe) {
    dispatch('view', recipe)
  }
</script>

<div class="recipe-list">
  <div class="search-filter">
    <div class="search-box">
      <input
        type="text"
        placeholder="搜索食谱名称、描述或食材..."
        bind:value={searchKeyword}
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>
    
    <div class="filter-box">
      <select bind:value={selectedCategory} class="category-select">
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? '全部分类' : category}
          </option>
        {/each}
      </select>
    </div>
  </div>

  {#if filteredRecipes.length === 0}
    <div class="empty-state">
      {#if $recipeStore.length === 0}
        <p class="empty-message">还没有任何食谱</p>
        <p class="empty-hint">点击"添加食谱"按钮创建您的第一个食谱吧！</p>
      {:else}
        <p class="empty-message">没有找到匹配的食谱</p>
        <p class="empty-hint">尝试使用其他关键词或切换分类</p>
      {/if}
    </div>
  {:else}
    <div class="card-grid">
      {#each filteredRecipes as recipe (recipe.id)}
        <RecipeCard {recipe} on:view={(e) => handleView(e.detail)} />
      {/each}
    </div>
    
    <div class="result-count">
      共 {filteredRecipes.length} 个食谱
      {#if searchKeyword || selectedCategory !== 'all'}
        （筛选自 {$recipeStore.length} 个）
      {/if}
    </div>
  {/if}
</div>

<style>
  .recipe-list {
    width: 100%;
  }

  .search-filter {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .search-input:focus {
    outline: none;
    border-color: #e74c3c;
  }

  .search-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
  }

  .filter-box {
    min-width: 150px;
  }

  .category-select {
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s;
    min-width: 150px;
  }

  .category-select:focus {
    outline: none;
    border-color: #e74c3c;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .empty-message {
    font-size: 1.3rem;
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-weight: bold;
  }

  .empty-hint {
    color: #7f8c8d;
    margin: 0;
    font-size: 0.95rem;
  }

  .result-count {
    text-align: center;
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    .search-filter {
      flex-direction: column;
      gap: 15px;
    }
    
    .search-box {
      min-width: auto;
    }
    
    .filter-box {
      min-width: auto;
    }
    
    .category-select {
      width: 100%;
    }
    
    .card-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
</style>