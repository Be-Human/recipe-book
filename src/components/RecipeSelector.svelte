<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore, categoryStore, filterRecipes } from '../store/recipeStore.js'
  
  const dispatch = createEventDispatcher()
  
  let searchKeyword = ''
  let selectedCategory = 'all'
  
  $: categories = ['all', ...$categoryStore]
  $: filteredRecipes = filterRecipes($recipeStore, searchKeyword, selectedCategory)
  
  function handleSelect(recipe) {
    dispatch('select', recipe.id)
  }
  
  function handleCancel() {
    dispatch('cancel')
  }
</script>

<div class="modal-overlay" on:click|self={handleCancel}>
  <div class="selector-modal">
    <div class="modal-header">
      <h3 class="modal-title">🍳 选择食谱</h3>
      <button class="close-btn" on:click={handleCancel}>
        ✕
      </button>
    </div>
    
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
      
      <select bind:value={selectedCategory} class="category-select">
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? '全部分类' : category}
          </option>
        {/each}
      </select>
    </div>
    
    <div class="recipe-list">
      {#if $recipeStore.length === 0}
        <div class="empty-state">
          <span class="empty-icon">📖</span>
          <p class="empty-message">还没有任何食谱</p>
          <p class="empty-hint">请先添加食谱</p>
        </div>
      {:else if filteredRecipes.length === 0}
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <p class="empty-message">没有找到匹配的食谱</p>
          <p class="empty-hint">尝试使用其他关键词或切换分类</p>
        </div>
      {:else}
        <div class="recipe-grid">
          {#each filteredRecipes as recipe (recipe.id)}
            <button 
              class="recipe-item"
              on:click={() => handleSelect(recipe)}
            >
              <div class="recipe-info">
                <span class="recipe-name">{recipe.name}</span>
                {#if recipe.category}
                  <span class="recipe-category">{recipe.category}</span>
                {/if}
              </div>
              {#if recipe.cookingTime}
                <span class="recipe-time">⏱️ {recipe.cookingTime}分钟</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="modal-footer">
      <button class="cancel-btn" on:click={handleCancel}>
        取消
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .selector-modal {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--text-light);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }

  .close-btn:hover {
    color: var(--text-primary);
    background: var(--bg-gradient-1);
  }

  .search-filter {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    transition: var(--transition);
    background: var(--bg-gradient-1);
    box-sizing: border-box;
    font-family: inherit;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    font-size: 1rem;
  }

  .category-select {
    padding: 12px 40px 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    background: var(--bg-gradient-1);
    cursor: pointer;
    transition: var(--transition);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23636E72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    font-family: inherit;
  }

  .category-select:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .recipe-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    min-height: 200px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 24px;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-message {
    margin: 0;
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  .empty-hint {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .recipe-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .recipe-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }

  .recipe-item:hover {
    background: var(--card-bg);
    border-color: var(--primary);
    transform: translateX(4px);
    box-shadow: var(--shadow-sm);
  }

  .recipe-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .recipe-name {
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recipe-category {
    color: var(--secondary);
    font-size: 0.8rem;
    font-weight: 500;
    background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%);
    padding: 2px 10px;
    border-radius: 10px;
    width: fit-content;
  }

  .recipe-time {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
  }

  .cancel-btn {
    padding: 10px 24px;
    border: 2px solid var(--border-color);
    background: var(--bg-gradient-1);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .cancel-btn:hover {
    border-color: var(--text-light);
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 12px;
    }

    .selector-modal {
      max-height: 90vh;
    }

    .modal-header {
      padding: 16px 20px;
    }

    .modal-title {
      font-size: 1.1rem;
    }

    .search-filter {
      padding: 12px 20px;
      flex-direction: column;
    }

    .search-box {
      min-width: auto;
    }

    .category-select {
      width: 100%;
    }

    .recipe-list {
      padding: 12px 20px;
    }

    .recipe-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .recipe-time {
      margin-left: 0;
    }

    .modal-footer {
      padding: 12px 20px;
    }

    .cancel-btn {
      width: 100%;
    }
  }
</style>