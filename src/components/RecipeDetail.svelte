<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore } from '../store/recipeStore.js'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  
  function handleBack() {
    dispatch('back')
  }
  
  function handleEdit() {
    dispatch('edit', recipe)
  }
  
  function handleDelete() {
    if (confirm('确定要删除这个食谱吗？')) {
      recipeStore.delete(recipe.id)
      dispatch('back')
    }
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

<div class="recipe-detail">
  <div class="detail-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <div class="action-buttons">
      <button class="edit-btn" on:click={handleEdit}>
        ✏️ 编辑
      </button>
      <button class="delete-btn" on:click={handleDelete}>
        🗑️ 删除
      </button>
    </div>
  </div>

  <div class="detail-content">
    <div class="content-header">
      <h1 class="recipe-title">{recipe.name}</h1>
      <span 
        class="category-tag"
        style="background-color: {getCategoryColor(recipe.category)}"
      >
        {recipe.category || '未分类'}
      </span>
    </div>

    {#if recipe.description}
      <p class="recipe-description">{recipe.description}</p>
    {/if}

    <div class="quick-info">
      <div class="info-item">
        <span class="info-icon">⏱️</span>
        <div class="info-text">
          <span class="info-label">烹饪时间</span>
          <span class="info-value">{recipe.cookingTime || '未知'} 分钟</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🥗</span>
        <div class="info-text">
          <span class="info-label">食材数量</span>
          <span class="info-value">{recipe.ingredients?.length || 0} 种</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">📝</span>
        <div class="info-text">
          <span class="info-label">步骤数量</span>
          <span class="info-value">{recipe.steps?.length || 0} 步</span>
        </div>
      </div>
    </div>

    {#if recipe.ingredients && recipe.ingredients.length > 0}
      <section class="detail-section">
        <h2 class="section-title">
          <span class="section-icon">🥕</span> 食材清单
        </h2>
        <div class="ingredients-list">
          {#each recipe.ingredients as ingredient, index (index)}
            <div class="ingredient-item">
              <span class="ingredient-name">{ingredient.name}</span>
              {#if ingredient.amount}
                <span class="ingredient-amount">{ingredient.amount}</span>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if recipe.steps && recipe.steps.length > 0}
      <section class="detail-section">
        <h2 class="section-title">
          <span class="section-icon">👨‍🍳</span> 制作步骤
        </h2>
        <div class="steps-list">
          {#each recipe.steps as step, index (index)}
            <div class="step-item">
              <div class="step-number">{index + 1}</div>
              <div class="step-content">
                {#if step.description}
                  <p class="step-description">{step.description}</p>
                {/if}
                {#if step.tip}
                  <p class="step-tip">💡 小贴士: {step.tip}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>

<style>
  .recipe-detail {
    width: 100%;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #2c3e50;
    font-size: 1rem;
    cursor: pointer;
    padding: 8px 0;
    transition: color 0.3s;
  }

  .back-btn:hover {
    color: #e74c3c;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .edit-btn, .delete-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .edit-btn {
    background-color: #3498db;
    color: white;
  }

  .edit-btn:hover {
    background-color: #2980b9;
  }

  .delete-btn {
    background-color: #e74c3c;
    color: white;
  }

  .delete-btn:hover {
    background-color: #c0392b;
  }

  .detail-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  .recipe-title {
    margin: 0;
    color: #2c3e50;
    font-size: 1.8rem;
  }

  .category-tag {
    padding: 6px 16px;
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
  }

  .recipe-description {
    color: #7f8c8d;
    font-size: 1.05rem;
    margin: 0 0 25px 0;
    line-height: 1.6;
  }

  .quick-info {
    display: flex;
    gap: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .info-icon {
    font-size: 1.5rem;
  }

  .info-text {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  .info-value {
    color: #2c3e50;
    font-size: 1rem;
    font-weight: bold;
  }

  .detail-section {
    margin-bottom: 30px;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #2c3e50;
    font-size: 1.3rem;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .ingredients-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .ingredient-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #e74c3c;
  }

  .ingredient-name {
    color: #2c3e50;
    font-weight: 500;
  }

  .ingredient-amount {
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .step-item {
    display: flex;
    gap: 15px;
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    padding: 10px 0;
  }

  .step-description {
    margin: 0;
    color: #2c3e50;
    line-height: 1.6;
  }

  .step-tip {
    margin: 10px 0 0 0;
    color: #e67e22;
    font-size: 0.9rem;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .detail-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-buttons {
      width: 100%;
    }

    .edit-btn, .delete-btn {
      flex: 1;
    }

    .detail-content {
      padding: 20px;
    }

    .recipe-title {
      font-size: 1.4rem;
    }

    .quick-info {
      gap: 15px;
      padding: 15px;
    }

    .ingredients-list {
      grid-template-columns: 1fr;
    }

    .step-item {
      gap: 10px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }
  }
</style>