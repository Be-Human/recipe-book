<script>
  import { createEventDispatcher } from 'svelte'
  import RecipeCard from './RecipeCard.svelte'
  import { recipeStore, categoryStore, filterRecipes, sortRecipes, SORT_OPTIONS, exportAllRecipesAsJson, exportRecipeAsJson, parseImportedJson } from '../store/recipeStore.js'
  
  let searchKeyword = ''
  let selectedCategory = 'all'
  let showFavoritesOnly = false
  let sortBy = 'createdAt'
  let selectionMode = false
  let selectedRecipeIds = new Set()
  let showImportModal = false
  let importError = ''
  let importConflicts = []
  let currentConflictIndex = 0
  let importRecipesData = []
  let importResults = null
  
  $: filteredRecipes = sortRecipes(
    filterRecipes($recipeStore, searchKeyword, selectedCategory, showFavoritesOnly),
    sortBy
  )
  $: categories = ['all', ...$categoryStore]
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
  
  function handleManageCategories() {
    dispatch('manageCategories')
  }
  
  function handleExportAll() {
    exportAllRecipesAsJson($recipeStore)
  }
  
  function handleExportSelected() {
    if (selectedRecipes.length === 0) return
    if (selectedRecipes.length === 1) {
      exportRecipeAsJson(selectedRecipes[0])
    } else {
      exportAllRecipesAsJson(selectedRecipes)
    }
  }
  
  function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content !== 'string') {
        importError = '无法读取文件内容'
        return
      }
      
      const result = parseImportedJson(content)
      if (!result.success) {
        importError = result.error || '解析失败'
        return
      }
      
      importError = ''
      importRecipesData = result.recipes
      
      const conflicts = []
      for (const imported of importRecipesData) {
        const existing = $recipeStore.find(r => r.id === imported.id)
        if (existing) {
          conflicts.push({ existing, imported })
        }
      }
      
      if (conflicts.length === 0) {
        doImport(null)
      } else {
        importConflicts = conflicts
        currentConflictIndex = 0
        showImportModal = true
      }
    }
    reader.onerror = () => {
      importError = '读取文件失败'
    }
    reader.readAsText(file)
    
    event.target.value = ''
  }
  
  function skipConflict() {
    if (currentConflictIndex < importConflicts.length - 1) {
      currentConflictIndex++
    } else {
      doImport('skip')
    }
  }
  
  function overwriteConflict() {
    if (currentConflictIndex < importConflicts.length - 1) {
      const conflict = importConflicts[currentConflictIndex]
      conflict.action = 'overwrite'
      currentConflictIndex++
    } else {
      const conflict = importConflicts[currentConflictIndex]
      conflict.action = 'overwrite'
      doImport('overwrite')
    }
  }
  
  function skipAllConflicts() {
    doImport('skip')
  }
  
  function overwriteAllConflicts() {
    doImport('overwrite')
  }
  
  function cancelImport() {
    showImportModal = false
    importConflicts = []
    currentConflictIndex = 0
    importRecipesData = []
    importResults = null
  }
  
  async function doImport(defaultConflictAction) {
    showImportModal = false
    
    const conflictActions = new Map()
    for (const conflict of importConflicts) {
      if (conflict.action) {
        conflictActions.set(conflict.existing.id, conflict.action)
      }
    }
    
    function onConflict(existing, imported) {
      const action = conflictActions.get(existing.id)
      if (action) return action
      return defaultConflictAction || 'skip'
    }
    
    const results = await recipeStore.importRecipes(importRecipesData, onConflict)
    importResults = results
    
    importConflicts = []
    currentConflictIndex = 0
    importRecipesData = []
    
    setTimeout(() => {
      importResults = null
    }, 5000)
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
      
      <button 
        class="manage-categories-btn"
        on:click={handleManageCategories}
        title="管理分类"
      >
        ⚙️ 管理分类
      </button>
      
      <select bind:value={sortBy} class="sort-select">
        {#each SORT_OPTIONS as option}
          <option value={option.value}>按{option.label}排序</option>
        {/each}
      </select>
      
      <div class="import-export-buttons">
        <label class="import-btn-label" title="导入食谱">
          <input
            type="file"
            accept=".json"
            on:change={handleImportFile}
            class="file-input-hidden"
          />
          <span class="import-btn">📥 导入</span>
        </label>
        <button 
          class="export-all-btn"
          on:click={handleExportAll}
          title="导出全部食谱"
        >
          📤 导出全部
        </button>
      </div>
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
            <button class="export-selected-btn" on:click={handleExportSelected}>
              📤 导出选中
            </button>
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
  
  {#if importError}
    <div class="import-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{importError}</span>
      <button class="close-error-btn" on:click={() => importError = ''}>✕</button>
    </div>
  {/if}
  
  {#if importResults}
    <div class="import-results">
      <div class="result-icon">✅</div>
      <div class="result-content">
        <h4 class="result-title">导入完成</h4>
        <div class="result-details">
          {#if importResults.imported > 0}
            <span class="result-item">新增: {importResults.imported} 个</span>
          {/if}
          {#if importResults.skipped > 0}
            <span class="result-item">跳过: {importResults.skipped} 个</span>
          {/if}
          {#if importResults.overwritten > 0}
            <span class="result-item">覆盖: {importResults.overwritten} 个</span>
          {/if}
        </div>
      </div>
      <button class="close-result-btn" on:click={() => importResults = null}>✕</button>
    </div>
  {/if}
</div>

{#if showImportModal && importConflicts.length > 0}
  <div class="modal-overlay">
    <div class="import-modal">
      <div class="modal-header">
        <h3 class="modal-title">⚠️ 检测到重复食谱</h3>
        <span class="modal-progress">
          冲突 {currentConflictIndex + 1} / {importConflicts.length}
        </span>
      </div>
      
      <div class="conflict-content">
        <div class="conflict-item existing">
          <h4 class="conflict-label">当前版本</h4>
          <div class="conflict-recipe-info">
            <span class="recipe-name">{importConflicts[currentConflictIndex].existing.name}</span>
            {#if importConflicts[currentConflictIndex].existing.category}
              <span class="recipe-category">{importConflicts[currentConflictIndex].existing.category}</span>
            {/if}
            {#if importConflicts[currentConflictIndex].existing.updatedAt}
              <span class="recipe-date">更新于 {new Date(importConflicts[currentConflictIndex].existing.updatedAt).toLocaleDateString('zh-CN')}</span>
            {/if}
          </div>
        </div>
        
        <div class="conflict-divider">
          <span class="conflict-icon">⚡</span>
        </div>
        
        <div class="conflict-item imported">
          <h4 class="conflict-label">导入版本</h4>
          <div class="conflict-recipe-info">
            <span class="recipe-name">{importConflicts[currentConflictIndex].imported.name}</span>
            {#if importConflicts[currentConflictIndex].imported.category}
              <span class="recipe-category">{importConflicts[currentConflictIndex].imported.category}</span>
            {/if}
            {#if importConflicts[currentConflictIndex].imported.updatedAt}
              <span class="recipe-date">更新于 {new Date(importConflicts[currentConflictIndex].imported.updatedAt).toLocaleDateString('zh-CN')}</span>
            {/if}
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <div class="action-group">
          <button class="modal-btn skip-btn" on:click={skipConflict}>
            跳过此项
          </button>
          <button class="modal-btn overwrite-btn" on:click={overwriteConflict}>
            覆盖此项
          </button>
        </div>
        <div class="action-group">
          <button class="modal-btn batch-btn skip-all-btn" on:click={skipAllConflicts}>
            全部跳过
          </button>
          <button class="modal-btn batch-btn overwrite-all-btn" on:click={overwriteAllConflicts}>
            全部覆盖
          </button>
        </div>
        <button class="modal-btn cancel-btn" on:click={cancelImport}>
          取消导入
        </button>
      </div>
    </div>
  </div>
{/if}

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

  .manage-categories-btn {
    padding: 12px 20px;
    border: 2px solid var(--border-color);
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(78, 205, 196, 0.3);
  }

  .manage-categories-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
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

  .export-selected-btn {
    padding: 10px 20px;
    border: none;
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
    color: white;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(108, 92, 231, 0.3);
  }

  .export-selected-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(108, 92, 231, 0.4);
  }

  .import-export-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .file-input-hidden {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
  }

  .import-btn-label {
    cursor: pointer;
  }

  .import-btn,
  .export-all-btn {
    padding: 12px 20px;
    border: 2px solid var(--border-color);
    background: white;
    color: var(--text-primary);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    white-space: nowrap;
  }

  .import-btn:hover,
  .export-all-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
  }

  .export-all-btn {
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
    border-color: #6c5ce7;
    color: white;
    box-shadow: 0 3px 10px rgba(108, 92, 231, 0.3);
  }

  .export-all-btn:hover {
    color: white;
    box-shadow: 0 5px 15px rgba(108, 92, 231, 0.4);
  }

  .import-error {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: #FFF5F5;
    border: 2px solid #FF4757;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .error-icon {
    font-size: 1.5rem;
  }

  .error-text {
    color: #FF4757;
    font-weight: 500;
  }

  .close-error-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #FF4757;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: var(--transition);
  }

  .close-error-btn:hover {
    background: rgba(255, 71, 87, 0.1);
  }

  .import-results {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    background: #F0FFF4;
    border: 2px solid #52C41A;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .result-icon {
    font-size: 1.8rem;
  }

  .result-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .result-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  .result-details {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .result-item {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .close-result-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #52C41A;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: var(--transition);
  }

  .close-result-btn:hover {
    background: rgba(82, 196, 26, 0.1);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .import-modal {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
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
    font-size: 1.2rem;
    font-weight: 600;
  }

  .modal-progress {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .conflict-content {
    display: flex;
    align-items: stretch;
    gap: 16px;
    padding: 24px;
  }

  .conflict-item {
    flex: 1;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    padding: 16px;
    border: 2px solid var(--border-color);
  }

  .conflict-item.existing {
    border-color: #636E72;
  }

  .conflict-item.imported {
    border-color: var(--primary);
  }

  .conflict-label {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .conflict-recipe-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .recipe-name {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .recipe-category {
    color: var(--secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .recipe-date {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .conflict-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
  }

  .conflict-icon {
    font-size: 1.5rem;
    background: #FFF9E6;
    padding: 8px 12px;
    border-radius: 50%;
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid var(--border-color);
  }

  .action-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .modal-btn {
    padding: 12px 24px;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    border: none;
  }

  .skip-btn {
    background: var(--border-color);
    color: var(--text-primary);
  }

  .skip-btn:hover {
    background: var(--text-light);
    transform: translateY(-1px);
  }

  .overwrite-btn {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 3px 10px rgba(255, 107, 53, 0.3);
  }

  .overwrite-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
  }

  .batch-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .skip-all-btn {
    background: white;
    border: 2px solid var(--border-color);
    color: var(--text-secondary);
  }

  .skip-all-btn:hover {
    border-color: var(--text-light);
    color: var(--text-primary);
  }

  .overwrite-all-btn {
    background: white;
    border: 2px solid var(--primary);
    color: var(--primary);
  }

  .overwrite-all-btn:hover {
    background: rgba(255, 107, 53, 0.05);
  }

  .cancel-btn {
    background: none;
    color: var(--text-secondary);
    text-decoration: underline;
    padding: 8px;
  }

  .cancel-btn:hover {
    color: var(--text-primary);
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
    
    .generate-shopping-btn,
    .export-selected-btn {
      width: 100%;
      text-align: center;
    }
    
    .import-export-buttons {
      width: 100%;
      justify-content: center;
    }
    
    .import-btn,
    .export-all-btn {
      flex: 1;
      text-align: center;
    }
    
    .conflict-content {
      flex-direction: column;
    }
    
    .conflict-divider {
      transform: rotate(90deg);
    }
    
    .modal-actions {
      padding: 16px;
    }
    
    .action-group {
      flex-direction: column;
    }
    
    .modal-btn {
      width: 100%;
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