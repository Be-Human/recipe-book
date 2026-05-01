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
  
  function toggleFavorite() {
    recipeStore.toggleFavorite(recipe.id)
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
  
  function getDifficultyColor(difficulty) {
    const colors = {
      '简单': '#52c41a',
      '中等': '#faad14',
      '困难': '#ff4d4f'
    }
    return colors[difficulty] || colors['中等']
  }
</script>

<div class="recipe-detail">
  <div class="detail-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <div class="action-buttons">
      <button 
        class="favorite-btn {recipe.isFavorite ? 'active' : ''}"
        on:click={toggleFavorite}
        title={recipe.isFavorite ? '取消收藏' : '添加收藏'}
      >
        {recipe.isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
      </button>
      <button class="edit-btn" on:click={handleEdit}>
        ✏️ 编辑
      </button>
      <button class="delete-btn" on:click={handleDelete}>
        🗑️ 删除
      </button>
    </div>
  </div>

  <div class="detail-content">
    {#if recipe.coverImage}
      <div class="cover-image-container">
        <img src={recipe.coverImage} alt={recipe.name} class="cover-image" />
      </div>
    {/if}

    <div class="content-header">
      <h1 class="recipe-title">{recipe.name}</h1>
      <span 
        class="category-tag"
        style="background: {getCategoryGradient(recipe.category)}"
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
      {#if recipe.difficulty}
        <div class="info-item">
          <span class="info-icon">📊</span>
          <div class="info-text">
            <span class="info-label">难度等级</span>
            <span class="info-value" style="color: {getDifficultyColor(recipe.difficulty)}">{recipe.difficulty}</span>
          </div>
        </div>
      {/if}
      {#if recipe.servings}
        <div class="info-item">
          <span class="info-icon">👥</span>
          <div class="info-text">
            <span class="info-label">份量人数</span>
            <span class="info-value">{recipe.servings} 人份</span>
          </div>
        </div>
      {/if}
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

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .favorite-btn {
    padding: 10px 20px;
    border: 2px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }

  .favorite-btn:hover {
    border-color: #FF6B81;
    color: #FF4757;
    transform: translateY(-2px);
  }

  .favorite-btn.active {
    background: linear-gradient(135deg, #FFF0F0 0%, #FFE4E4 100%);
    border-color: #FF6B81;
    color: #FF4757;
  }

  .edit-btn, .delete-btn {
    padding: 10px 20px;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }

  .edit-btn {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .delete-btn {
    background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
    color: white;
  }

  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .detail-content {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 32px;
  }

  .cover-image-container {
    width: 100%;
    height: 300px;
    overflow: hidden;
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .recipe-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 700;
  }

  .category-tag {
    padding: 6px 18px;
    border-radius: 20px;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  .recipe-description {
    color: var(--text-secondary);
    font-size: 1.05rem;
    margin: 0 0 28px 0;
    line-height: 1.7;
    padding: 16px 20px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--primary);
  }

  .quick-info {
    display: flex;
    gap: 24px;
    padding: 24px;
    background: linear-gradient(135deg, #FFF8F5 0%, #FFEDE6 100%);
    border-radius: var(--radius-md);
    margin-bottom: 32px;
    flex-wrap: wrap;
    border: 1px solid rgba(255, 107, 53, 0.1);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .info-icon {
    font-size: 1.8rem;
  }

  .info-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-label {
    color: var(--text-light);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    color: var(--primary-dark);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .detail-section {
    margin-bottom: 36px;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);
    font-size: 1.25rem;
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);
    font-weight: 600;
  }

  .section-icon {
    font-size: 1.6rem;
  }

  .ingredients-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }

  .ingredient-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--primary);
    transition: var(--transition);
  }

  .ingredient-item:hover {
    transform: translateX(4px);
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .ingredient-name {
    color: var(--text-primary);
    font-weight: 600;
  }

  .ingredient-amount {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .step-item {
    display: flex;
    gap: 18px;
    padding: 20px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    transition: var(--transition);
  }

  .step-item:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .step-number {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }

  .step-content {
    flex: 1;
    padding: 4px 0;
  }

  .step-description {
    margin: 0;
    color: var(--text-primary);
    line-height: 1.7;
    font-size: 1rem;
  }

  .step-tip {
    margin: 12px 0 0 0;
    color: var(--accent);
    font-size: 0.9rem;
    font-style: italic;
    padding: 10px 14px;
    background: #FFF9E6;
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--accent);
  }

  @media (max-width: 768px) {
    .detail-header {
      flex-direction: column;
      align-items: stretch;
    }

    .back-btn {
      text-align: center;
    }

    .action-buttons {
      width: 100%;
      flex-wrap: wrap;
    }

    .favorite-btn, .edit-btn, .delete-btn {
      flex: 1;
      min-width: 100px;
    }

    .detail-content {
      padding: 20px;
    }

    .cover-image-container {
      height: 200px;
      margin-bottom: 16px;
    }

    .recipe-title {
      font-size: 1.4rem;
    }

    .recipe-description {
      padding: 12px 16px;
      margin-bottom: 20px;
    }

    .quick-info {
      gap: 16px;
      padding: 16px;
    }

    .ingredients-list {
      grid-template-columns: 1fr;
    }

    .step-item {
      gap: 12px;
      padding: 16px;
    }

    .step-number {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }
  }
</style>