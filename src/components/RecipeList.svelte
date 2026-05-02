<script>
  import { createEventDispatcher } from 'svelte'
  import RecipeCard from './RecipeCard.svelte'
  import { recipeStore, getCategories, filterRecipes, sortRecipes, SORT_OPTIONS } from '../store/recipeStore.js'
  
  let searchKeyword = ''
  let selectedCategory = 'all'
  let showFavoritesOnly = false
  let sortBy = 'createdAt'
  let selectionMode = false
  let selectedRecipeIds = new Set()
  
  $: filteredRecipes = sortRecipes(
    filterRecipes($recipeStore, searchKeyword, selectedCategory, showFavoritesOnly),
    sortBy
  )
  $: categories = ['all', ...getCategories($recipeStore)]
  $: favoriteCount = $recipeStore.filter(r => r.isFavorite).length
  $: selectedCount = selectedRecipeIds.size
  $: selectedRecipes = $recipeStore.filter(r => selectedRecipeIds.has(r.id))
  
  const dispatch = createEventDispatcher()
  
  function handleView(recipe) {
    if (!selectionMode) {
      dispatch('view', recipe)
    }
  }
  
  function toggleSelectionMode() {
    selectionMode = !selectionMode
    if (!selectionMode) {
      selectedRecipeIds.clear()
    }
  }
  
  function toggleRecipeSelection(recipeId) {
    if (selectedRecipeIds.has(recipeId)) {
      selectedRecipeIds.delete(recipeId)
    } else {
      selectedRecipeIds.add(recipeId)
    }
    selectedRecipeIds = new Set(selectedRecipeIds)
  }
  
  function selectAll() {
    filteredRecipes.forEach(r => selectedRecipeIds.add(r.id))
    selectedRecipeIds = new Set(selectedRecipeIds)
  }
  
  function clearSelection() {
    selectedRecipeIds.clear()
    selectedRecipeIds = new Set(selectedRecipeIds)
  }
  
  function generateShoppingList() {
    dispatch('generateShoppingList', selectedRecipes)
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
        class="selection-mode-btn {selectionMode ? 'active' : ''}"
        on:click={toggleSelectionMode}
        title={selectionMode ? '退出选择模式' : '进入选择模式'}
      >
        {selectionMode ? '✓ 选择中' : '☐ 选择食谱'}
      </button>
      
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
    
    {#if selectionMode}
      <div class="selection-controls">
        <div class="selection-info">
          已选择 <span class="selection-count">{selectedCount}</span> 个食谱
        </div>
        <div class="selection-actions">
          <button class="select-action-btn" on:click={selectAll}>全选</button>
          <button class="select-action-btn" on:click={clearSelection}>清除</button>
          {#if selectedCount > 0}
            <button class="generate-shopping-btn" on:click={generateShoppingList}>
              🛒 生成购物清单
            </button>
          {/if}
        </div>
      </div>
    {/if}
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
        <div class="recipe-card-wrapper" class:selected={selectedRecipeIds.has(recipe.id)}>
          {#if selectionMode}
            <label class="selection-checkbox">
              <input
                type="checkbox"
                checked={selectedRecipeIds.has(recipe.id)}
                on:change={() => toggleRecipeSelection(recipe.id)}
              />
              <span class="checkmark"></span>
            </label>
          {/if}
          <RecipeCard {recipe} on:view={(e) => handleView(e.detail)} />
        </div>
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

  .selection-mode-btn {
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

  .selection-mode-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .selection-mode-btn.active {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-color: var(--primary);
    color: white;
  }

  .selection-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #FFF8F5 0%, #FFEDE6 100%);
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 107, 53, 0.2);
  }

  .selection-info {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .selection-count {
    color: var(--primary);
    font-weight: 700;
    font-size: 1.1rem;
  }

  .selection-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  .select-action-btn {
    padding: 8px 16px;
    border: 2px solid var(--border-color);
    background: white;
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .select-action-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .generate-shopping-btn {
    padding: 10px 20px;
    border: none;
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(78, 205, 196, 0.3);
  }

  .generate-shopping-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
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

  .recipe-card-wrapper {
    position: relative;
    transition: var(--transition);
  }

  .recipe-card-wrapper.selected {
    transform: scale(1.02);
  }

  .recipe-card-wrapper.selected :global(.recipe-card) {
    box-shadow: 0 0 0 3px var(--primary), var(--shadow-lg);
  }

  .selection-checkbox {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selection-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .checkmark {
    width: 24px;
    height: 24px;
    background: white;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .selection-checkbox:hover .checkmark {
    border-color: var(--primary);
  }

  .selection-checkbox input:checked + .checkmark {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-color: var(--primary);
  }

  .selection-checkbox input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-weight: bold;
    font-size: 14px;
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
      flex-wrap: wrap;
    }
    
    .selection-mode-btn,
    .favorite-filter-btn,
    .category-select,
    .sort-select {
      flex: 1;
      min-width: auto;
      font-size: 0.85rem;
    }
    
    .selection-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    
    .selection-info {
      text-align: center;
    }
    
    .selection-actions {
      justify-content: center;
    }
    
    .generate-shopping-btn {
      width: 100%;
      text-align: center;
    }
    
    .card-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .selection-checkbox {
      top: 8px;
      right: 8px;
    }
  }
</style>