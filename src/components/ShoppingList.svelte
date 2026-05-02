<script>
  import { createEventDispatcher } from 'svelte'
  
  export let recipes = []
  
  const dispatch = createEventDispatcher()
  
  let purchasedItems = new Set()
  
  $: mergedIngredients = mergeIngredients(recipes)
  $: purchasedCount = purchasedItems.size
  $: totalCount = mergedIngredients.length
  $: allPurchased = totalCount > 0 && purchasedCount === totalCount
  
  function mergeIngredients(recipeList) {
    const ingredientMap = new Map()
    
    recipeList.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
          const name = ingredient.name.trim()
          if (!name) return
          
          const key = name.toLowerCase()
          
          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, {
              name: name,
              amounts: [],
              sources: [],
              id: key
            })
          }
          
          const entry = ingredientMap.get(key)
          
          if (ingredient.amount && ingredient.amount.trim()) {
            const amountStr = ingredient.amount.trim()
            if (!entry.amounts.includes(amountStr)) {
              entry.amounts.push(amountStr)
            }
          }
          
          if (!entry.sources.find(s => s.id === recipe.id)) {
            entry.sources.push({
              id: recipe.id,
              name: recipe.name
            })
          }
        })
      }
    })
    
    return Array.from(ingredientMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'zh')
    )
  }
  
  function parseAmount(amount) {
    const match = amount.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2] || ''
      }
    }
    return null
  }
  
  function formatAmounts(amounts) {
    if (amounts.length === 0) return ''
    
    const unitGroups = new Map()
    
    amounts.forEach(amount => {
      const parsed = parseAmount(amount)
      if (parsed) {
        const unit = parsed.unit || ''
        if (!unitGroups.has(unit)) {
          unitGroups.set(unit, 0)
        }
        unitGroups.set(unit, unitGroups.get(unit) + parsed.value)
      }
    })
    
    if (unitGroups.size > 0) {
      const formatted = Array.from(unitGroups.entries()).map(([unit, value]) => {
        const numStr = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '')
        return unit ? `${numStr}${unit}` : numStr
      })
      return formatted.join(' + ')
    }
    
    return amounts.join('、')
  }
  
  function togglePurchased(ingredientId) {
    if (purchasedItems.has(ingredientId)) {
      purchasedItems.delete(ingredientId)
    } else {
      purchasedItems.add(ingredientId)
    }
    purchasedItems = new Set(purchasedItems)
  }
  
  function toggleAll() {
    if (allPurchased) {
      purchasedItems.clear()
    } else {
      mergedIngredients.forEach(ing => purchasedItems.add(ing.id))
    }
    purchasedItems = new Set(purchasedItems)
  }
  
  function clearPurchased() {
    purchasedItems.clear()
    purchasedItems = new Set(purchasedItems)
  }
  
  function handleBack() {
    dispatch('back')
  }
  
  function getSourceNames(sources) {
    return sources.map(s => s.name).join('、')
  }
</script>

<div class="shopping-list">
  <div class="list-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <h1 class="list-title">🛒 购物清单</h1>
  </div>

  <div class="list-summary">
    <div class="summary-item">
      <span class="summary-icon">📋</span>
      <span class="summary-text">来自 <strong>{recipes.length}</strong> 个食谱</span>
    </div>
    <div class="summary-item">
      <span class="summary-icon">🥕</span>
      <span class="summary-text">共 <strong>{totalCount}</strong> 种食材</span>
    </div>
    {#if totalCount > 0}
      <div class="summary-item">
        <span class="summary-icon">✓</span>
        <span class="summary-text">已购买 <strong>{purchasedCount}</strong> / {totalCount}</span>
      </div>
    {/if}
  </div>

  {#if totalCount > 0}
    <div class="list-actions">
      <button class="action-btn" on:click={toggleAll}>
        {allPurchased ? '☐ 取消全选' : '✓ 全选已购买'}
      </button>
      {#if purchasedCount > 0}
        <button class="action-btn" on:click={clearPurchased}>
          清除已购标记
        </button>
      {/if}
    </div>

    <div class="ingredients-container">
      {#each mergedIngredients as ingredient (ingredient.id)}
        <label 
          class="ingredient-item"
          class:purchased={purchasedItems.has(ingredient.id)}
        >
          <span class="item-checkbox">
            <input
              type="checkbox"
              checked={purchasedItems.has(ingredient.id)}
              on:change={() => togglePurchased(ingredient.id)}
            />
            <span class="checkmark"></span>
          </span>
          
          <span class="item-content">
            <span class="item-main">
              <span class="item-name">{ingredient.name}</span>
              {#if ingredient.amounts.length > 0}
                <span class="item-amount">{formatAmounts(ingredient.amounts)}</span>
              {/if}
            </span>
            {#if ingredient.sources.length > 0}
              <span class="item-sources">
                <span class="sources-label">来自：</span>
                <span class="sources-text">{getSourceNames(ingredient.sources)}</span>
              </span>
            {/if}
          </span>
        </label>
      {/each}
    </div>

    {#if allPurchased}
      <div class="completion-banner">
        <span class="completion-icon">🎉</span>
        <span class="completion-text">太棒了！所有食材都已购买完毕！</span>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <span class="empty-icon">🛒</span>
      <p class="empty-message">购物清单为空</p>
      <p class="empty-hint">请返回列表选择至少一个食谱</p>
    </div>
  {/if}
</div>

<style>
  .shopping-list {
    width: 100%;
  }

  .list-header {
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

  .list-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .list-summary {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    padding: 20px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .summary-icon {
    font-size: 1.4rem;
  }

  .summary-text {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .summary-text strong {
    color: var(--primary);
    font-weight: 700;
    font-size: 1.1rem;
  }

  .list-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .action-btn {
    padding: 10px 18px;
    border: 2px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .action-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .ingredients-container {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 8px;
  }

  .ingredient-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
  }

  .ingredient-item:hover {
    background: var(--bg-gradient-1);
  }

  .ingredient-item + .ingredient-item {
    border-top: 1px solid var(--border-color);
  }

  .ingredient-item.purchased {
    opacity: 0.6;
  }

  .ingredient-item.purchased .item-name {
    text-decoration: line-through;
    color: var(--text-light);
  }

  .ingredient-item.purchased .item-amount,
  .ingredient-item.purchased .item-sources {
    color: var(--text-light);
  }

  .item-checkbox {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .item-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 22px;
    height: 22px;
  }

  .item-checkbox .checkmark {
    width: 22px;
    height: 22px;
    background: white;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }

  .item-checkbox:hover .checkmark {
    border-color: var(--primary);
  }

  .item-checkbox input:checked + .checkmark {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    border-color: var(--secondary);
  }

  .item-checkbox input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-weight: bold;
    font-size: 14px;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-main {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  .item-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    transition: var(--transition);
  }

  .item-amount {
    font-size: 0.9rem;
    color: var(--secondary);
    font-weight: 500;
    background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%);
    padding: 2px 10px;
    border-radius: 12px;
  }

  .item-sources {
    margin-top: 6px;
    font-size: 0.8rem;
    color: var(--text-light);
  }

  .sources-label {
    color: var(--text-light);
  }

  .sources-text {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .completion-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    margin-top: 20px;
    background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%);
    border-radius: var(--radius-lg);
    border: 2px solid var(--secondary);
  }

  .completion-icon {
    font-size: 1.8rem;
  }

  .completion-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--secondary);
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

  @media (max-width: 768px) {
    .list-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .back-btn {
      text-align: center;
    }

    .list-title {
      text-align: center;
      font-size: 1.3rem;
    }

    .list-summary {
      padding: 16px;
      gap: 16px;
      justify-content: center;
    }

    .list-actions {
      justify-content: center;
    }

    .action-btn {
      flex: 1;
      min-width: auto;
      text-align: center;
    }

    .ingredient-item {
      padding: 12px 14px;
    }

    .completion-banner {
      flex-direction: column;
      text-align: center;
      padding: 16px;
    }
  }
</style>
