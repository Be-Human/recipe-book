<script>
  import { createEventDispatcher } from 'svelte'
  import { categoryStore, recipeStore } from '../store/recipeStore.js'
  
  export let recipes = []
  
  const dispatch = createEventDispatcher()
  
  let newCategoryName = ''
  let editingCategory = null
  let editingName = ''
  let categoryToDelete = null
  
  function handleBack() {
    dispatch('back')
  }
  
  function addCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    
    if ($categoryStore.includes(trimmed)) {
      alert('该分类已存在')
      return
    }
    
    categoryStore.add(trimmed)
    newCategoryName = ''
  }
  
  function startEdit(category) {
    editingCategory = category
    editingName = category
  }
  
  function saveEdit() {
    if (!editingCategory) return
    const trimmed = editingName.trim()
    
    if (!trimmed) {
      alert('分类名称不能为空')
      return
    }
    
    if (trimmed !== editingCategory && $categoryStore.includes(trimmed)) {
      alert('该分类已存在')
      return
    }
    
    if (trimmed !== editingCategory) {
      const recipesToUpdate = recipes.filter(r => r.category === editingCategory)
      recipesToUpdate.forEach(recipe => {
        recipeStore.update(recipe.id, { category: trimmed })
      })
      categoryStore.rename(editingCategory, trimmed)
    }
    
    editingCategory = null
    editingName = ''
  }
  
  function cancelEdit() {
    editingCategory = null
    editingName = ''
  }
  
  function confirmDelete(category) {
    const usedCount = categoryStore.getUsedCount(category, recipes)
    if (usedCount > 0) {
      if (!confirm(`分类"${category}"正在被 ${usedCount} 个食谱使用。确定要删除吗？这些食谱的分类将变为空。`)) {
        return
      }
      const recipesToUpdate = recipes.filter(r => r.category === category)
      recipesToUpdate.forEach(recipe => {
        recipeStore.update(recipe.id, { category: '' })
      })
    }
    categoryStore.delete(category)
  }
  
  function getUsedCount(category) {
    return categoryStore.getUsedCount(category, recipes)
  }
</script>

<div class="category-manager">
  <div class="manager-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <h1 class="manager-title">⚙️ 分类管理</h1>
  </div>

  <div class="manager-content">
    <section class="add-section">
      <h2 class="section-title">添加新分类</h2>
      <div class="add-form">
        <input
          type="text"
          bind:value={newCategoryName}
          class="form-input"
          placeholder="输入新分类名称"
          on:keydown={(e) => e.key === 'Enter' && addCategory()}
        />
        <button class="add-btn" on:click={addCategory}>
          + 添加
        </button>
      </div>
    </section>

    <section class="list-section">
      <h2 class="section-title">现有分类（共 {$categoryStore.length} 个）</h2>
      
      {#if $categoryStore.length === 0}
        <div class="empty-state">
          <p class="empty-message">暂无自定义分类</p>
          <p class="empty-hint">请添加新分类</p>
        </div>
      {:else}
        <div class="category-list">
          {#each $categoryStore as category (category)}
            <div class="category-item">
              {#if editingCategory === category}
                <div class="edit-form">
                  <input
                    type="text"
                    bind:value={editingName}
                    class="form-input edit-input"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autofocus
                  />
                  <button class="action-btn save" on:click={saveEdit}>
                    ✓ 保存
                  </button>
                  <button class="action-btn cancel" on:click={cancelEdit}>
                    ✕ 取消
                  </button>
                </div>
              {:else}
                <div class="category-info">
                  <span class="category-name">{category}</span>
                  <span class="used-count">
                    {getUsedCount(category)} 个食谱
                  </span>
                </div>
                <div class="category-actions">
                  <button 
                    class="action-btn edit"
                    on:click={() => startEdit(category)}
                    title="编辑分类"
                  >
                    ✏️ 编辑
                  </button>
                  <button 
                    class="action-btn delete"
                    on:click={() => confirmDelete(category)}
                    title="删除分类"
                  >
                    🗑️ 删除
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  .category-manager {
    width: 100%;
  }

  .manager-header {
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

  .manager-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .manager-content {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 32px;
  }

  .section-title {
    margin: 0 0 16px 0;
    color: var(--text-primary);
    font-size: 1.15rem;
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-color);
  }

  .add-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
  }

  .add-form {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .form-input {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    transition: var(--transition);
    background: var(--bg-gradient-1);
    font-family: inherit;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .add-btn {
    padding: 12px 24px;
    border: none;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(255, 107, 53, 0.4);
  }

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
  }

  .list-section {
    margin-bottom: 0;
  }

  .empty-state {
    text-align: center;
    padding: 40px 24px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
  }

  .empty-message {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .empty-hint {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    transition: var(--transition);
    flex-wrap: wrap;
    gap: 12px;
  }

  .category-item:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .category-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
  }

  .used-count {
    color: var(--text-secondary);
    font-size: 0.85rem;
    padding: 4px 12px;
    background: var(--card-bg);
    border-radius: 12px;
    font-weight: 500;
  }

  .category-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .action-btn.edit {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
  }

  .action-btn.edit:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .action-btn.delete {
    background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
    color: white;
  }

  .action-btn.delete:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .action-btn.save {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    color: white;
  }

  .action-btn.save:hover {
    transform: translateY(-1px);
  }

  .action-btn.cancel {
    background: var(--border-color);
    color: var(--text-primary);
  }

  .action-btn.cancel:hover {
    background: var(--text-light);
  }

  .edit-form {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    width: 100%;
  }

  .edit-input {
    flex: 1;
    min-width: 150px;
  }

  @media (max-width: 768px) {
    .manager-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .back-btn {
      text-align: center;
    }

    .manager-title {
      font-size: 1.3rem;
      text-align: center;
    }

    .manager-content {
      padding: 20px;
    }

    .add-form {
      flex-direction: column;
    }

    .form-input {
      min-width: auto;
    }

    .add-btn {
      width: 100%;
    }

    .category-item {
      flex-direction: column;
      align-items: stretch;
    }

    .category-actions {
      width: 100%;
    }

    .action-btn {
      flex: 1;
      text-align: center;
    }

    .edit-form {
      flex-direction: column;
    }
  }
</style>