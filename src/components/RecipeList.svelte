<script>
  import { createEventDispatcher } from 'svelte'
  import RecipeCard from './RecipeCard.svelte'
  import { recipeStore, getCategories, filterRecipes, sortRecipes, SORT_OPTIONS } from '../store/recipeStore.js'
  
  let searchKeyword = ''
  let selectedCategory = 'all'
  let showFavoritesOnly = false
  let sortBy = 'createdAt'
  
  $: filteredRecipes = sortRecipes(
    filterRecipes($recipeStore, searchKeyword, selectedCategory, showFavoritesOnly),
    sortBy
  )
  $: categories = ['all', ...getCategories($recipeStore)]
  $: favoriteCount = $recipeStore.filter(r => r.isFavorite).length
  
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
    
    <div class="filter-controls">
      <button 
        class="favorite-filter-btn {showFavoritesOnly ? 'active' : ''}"
        on:click={() => showFavoritesOnly = !showFavoritesOnly}
        title={showFavoritesOnly ? '显示全部' : '只显示收藏'}
      >
        {showFavoritesOnly ? '❤️ 收藏中' : '🤍 收藏'} ({favoriteCount})
      </button>
      
      <select bind:value={selectedCategory} class="category-select">
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? '全部分类' : category}
          </option>
        {/each}
      </select>
      
      <select bind:value={sortBy} class="sort-select">
        {#each SORT_OPTIONS as option}
          <option value={option.value}>按{option.label}排序</option>
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
    flex-direction: column;
    gap: 16px;
    margin-bottom: 28px;
    padding: 20px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .search-box {
    position: relative;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 14px 44px 14px 18px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    transition: var(--transition);
    background: var(--bg-gradient-1);
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .search-input::placeholder {
    color: var(--text-light);
  }

  .search-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    font-size: 1.1rem;
  }

  .filter-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .favorite-filter-btn {
    padding: 12px 20px;
    border: 2px solid var(--border-color);
    background: var(--bg-gradient-1);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    white-space: nowrap;
  }

  .favorite-filter-btn:hover {
    border-color: #FF6B81;
    color: #FF4757;
  }

  .favorite-filter-btn.active {
    background: linear-gradient(135deg, #FFF0F0 0%, #FFE4E4 100%);
    border-color: #FF6B81;
    color: #FF4757;
  }

  .category-select,
  .sort-select {
    padding: 14px 44px 14px 18px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    background: var(--bg-gradient-1);
    cursor: pointer;
    transition: var(--transition);
    min-width: 150px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23636E72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 18px;
  }

  .category-select:focus,
  .sort-select:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .empty-state::before {
    content: '🍽️';
    font-size: 4rem;
    display: block;
    margin-bottom: 16px;
  }

  .empty-message {
    font-size: 1.25rem;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .empty-hint {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.95rem;
  }

  .result-count {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 16px;
    padding: 10px;
    background: var(--card-bg);
    border-radius: var(--radius-md);
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    .search-filter {
      gap: 12px;
      padding: 16px;
    }
    
    .search-box {
      min-width: auto;
    }
    
    .filter-controls {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }
    
    .favorite-filter-btn,
    .category-select,
    .sort-select {
      flex: 1;
      min-width: auto;
      font-size: 0.85rem;
    }
    
    .card-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>