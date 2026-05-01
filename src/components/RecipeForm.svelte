<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore } from '../store/recipeStore.js'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  const isEdit = !!recipe
  
  let formData = {
    name: recipe?.name || '',
    category: recipe?.category || '',
    cookingTime: recipe?.cookingTime || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients?.map(ing => ({ ...ing })) || [{ name: '', amount: '' }],
    steps: recipe?.steps?.map(step => ({ ...step })) || [{ description: '', tip: '' }]
  }
  
  const categories = [
    '中式料理',
    '西式料理', 
    '日式料理',
    '韩式料理',
    '甜点',
    '汤品',
    '主食',
    '其他'
  ]
  
  let errors = {}
  
  function validate() {
    errors = {}
    
    if (!formData.name.trim()) {
      errors.name = '食谱名称不能为空'
    }
    
    if (!formData.category) {
      errors.category = '请选择分类'
    }
    
    if (formData.cookingTime && isNaN(parseInt(formData.cookingTime))) {
      errors.cookingTime = '烹饪时间必须是数字'
    }
    
    const hasIngredients = formData.ingredients.some(ing => ing.name.trim())
    if (!hasIngredients) {
      errors.ingredients = '至少添加一种食材'
    }
    
    const hasSteps = formData.steps.some(step => step.description.trim())
    if (!hasSteps) {
      errors.steps = '至少添加一个制作步骤'
    }
    
    return Object.keys(errors).length === 0
  }
  
  function handleSubmit() {
    if (!validate()) return
    
    const recipeData = {
      name: formData.name.trim(),
      category: formData.category,
      cookingTime: formData.cookingTime ? parseInt(formData.cookingTime) : null,
      description: formData.description.trim(),
      ingredients: formData.ingredients.filter(ing => ing.name.trim()),
      steps: formData.steps.filter(step => step.description.trim())
    }
    
    if (isEdit) {
      recipeStore.update(recipe.id, recipeData)
    } else {
      recipeStore.add(recipeData)
    }
    
    dispatch('save')
  }
  
  function handleCancel() {
    dispatch('cancel')
  }
  
  function addIngredient() {
    formData.ingredients = [...formData.ingredients, { name: '', amount: '' }]
  }
  
  function removeIngredient(index) {
    if (formData.ingredients.length > 1) {
      formData.ingredients = formData.ingredients.filter((_, i) => i !== index)
    }
  }
  
  function addStep() {
    formData.steps = [...formData.steps, { description: '', tip: '' }]
  }
  
  function removeStep(index) {
    if (formData.steps.length > 1) {
      formData.steps = formData.steps.filter((_, i) => i !== index)
    }
  }
</script>

<div class="recipe-form">
  <div class="form-header">
    <button class="back-btn" on:click={handleCancel}>
      ← 取消
    </button>
    <h1 class="form-title">
      {isEdit ? '✏️ 编辑食谱' : '➕ 新建食谱'}
    </h1>
  </div>

  <div class="form-content">
    <form on:submit|preventDefault={handleSubmit}>
      <section class="form-section">
        <h2 class="section-title">📋 基本信息</h2>
        
        <div class="form-group">
          <label for="name" class="form-label">
            食谱名称 <span class="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            class="form-input {errors.name ? 'error' : ''}"
            placeholder="请输入食谱名称"
          />
          {#if errors.name}
            <span class="error-message">{errors.name}</span>
          {/if}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category" class="form-label">
              分类 <span class="required">*</span>
            </label>
            <select
              id="category"
              bind:value={formData.category}
              class="form-select {errors.category ? 'error' : ''}"
            >
              <option value="">请选择分类</option>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
            {#if errors.category}
              <span class="error-message">{errors.category}</span>
            {/if}
          </div>

          <div class="form-group">
            <label for="cookingTime" class="form-label">
              烹饪时间（分钟）
            </label>
            <input
              type="number"
              id="cookingTime"
              bind:value={formData.cookingTime}
              class="form-input {errors.cookingTime ? 'error' : ''}"
              placeholder="例如：30"
              min="1"
            />
            {#if errors.cookingTime}
              <span class="error-message">{errors.cookingTime}</span>
            {/if}
          </div>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">
            简介
          </label>
          <textarea
            id="description"
            bind:value={formData.description}
            class="form-textarea"
            placeholder="简单描述一下这道菜的特点..."
            rows="3"
          />
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2 class="section-title">🥕 食材清单 <span class="required">*</span></h2>
          <button 
            type="button" 
            class="add-item-btn"
            on:click={addIngredient}
          >
            + 添加食材
          </button>
        </div>
        
        {#if errors.ingredients}
          <span class="error-message block">{errors.ingredients}</span>
        {/if}

        <div class="items-list">
          {#each formData.ingredients as ingredient, index (index)}
            <div class="item-row">
              <span class="item-number">{index + 1}.</span>
              <input
                type="text"
                class="form-input"
                bind:value={ingredient.name}
                placeholder="食材名称"
              />
              <input
                type="text"
                class="form-input amount-input"
                bind:value={ingredient.amount}
                placeholder="用量（可选）"
              />
              <button
                type="button"
                class="remove-btn"
                on:click={() => removeIngredient(index)}
                disabled={formData.ingredients.length <= 1}
              >
                🗑️
              </button>
            </div>
          {/each}
        </div>
      </section>

      <section class="form-section">
        <div class="section-header">
          <h2 class="section-title">👨‍🍳 制作步骤 <span class="required">*</span></h2>
          <button 
            type="button" 
            class="add-item-btn"
            on:click={addStep}
          >
            + 添加步骤
          </button>
        </div>
        
        {#if errors.steps}
          <span class="error-message block">{errors.steps}</span>
        {/if}

        <div class="steps-form-list">
          {#each formData.steps as step, index (index)}
            <div class="step-form-row">
              <div class="step-number-badge">{index + 1}</div>
              <div class="step-form-content">
                <textarea
                  class="form-textarea"
                  bind:value={step.description}
                  placeholder="步骤描述"
                  rows="2"
                />
                <input
                  type="text"
                  class="form-input tip-input"
                  bind:value={step.tip}
                  placeholder="💡 小贴士（可选）"
                />
              </div>
              <button
                type="button"
                class="remove-btn"
                on:click={() => removeStep(index)}
                disabled={formData.steps.length <= 1}
              >
                🗑️
              </button>
            </div>
          {/each}
        </div>
      </section>

      <div class="form-actions">
        <button type="button" class="cancel-btn" on:click={handleCancel}>
          取消
        </button>
        <button type="submit" class="save-btn">
          {isEdit ? '保存修改' : '创建食谱'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .recipe-form {
    width: 100%;
  }

  .form-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
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

  .form-title {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
  }

  .form-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
  }

  .form-section {
    margin-bottom: 35px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e0e0e0;
  }

  .form-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .section-title {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 1.2rem;
  }

  .section-header .section-title {
    margin-bottom: 0;
  }

  .required {
    color: #e74c3c;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 500;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
    font-family: inherit;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #e74c3c;
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: #e74c3c;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .error-message {
    display: inline-block;
    margin-top: 5px;
    color: #e74c3c;
    font-size: 0.85rem;
  }

  .error-message.block {
    display: block;
    margin: 0 0 15px 0;
  }

  .add-item-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .add-item-btn:hover {
    background-color: #2980b9;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .item-number {
    color: #7f8c8d;
    font-weight: 500;
    min-width: 25px;
  }

  .amount-input {
    max-width: 150px;
  }

  .steps-form-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .step-form-row {
    display: flex;
    gap: 15px;
    align-items: flex-start;
  }

  .step-number-badge {
    width: 36px;
    height: 36px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .step-form-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tip-input {
    background: #fff9f0;
  }

  .remove-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
    opacity: 0.6;
    transition: opacity 0.3s;
  }

  .remove-btn:hover:not(:disabled) {
    opacity: 1;
  }

  .remove-btn:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
  }

  .cancel-btn,
  .save-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
  }

  .cancel-btn {
    background-color: #ecf0f1;
    color: #2c3e50;
  }

  .cancel-btn:hover {
    background-color: #bdc3c7;
  }

  .save-btn {
    background-color: #e74c3c;
    color: white;
  }

  .save-btn:hover {
    background-color: #c0392b;
  }

  @media (max-width: 768px) {
    .form-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .form-title {
      font-size: 1.3rem;
    }

    .form-content {
      padding: 20px;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .item-row {
      flex-wrap: wrap;
    }

    .item-number {
      order: -1;
      width: 100%;
      margin-bottom: 5px;
    }

    .amount-input {
      max-width: none;
      flex: 1;
    }

    .step-form-row {
      gap: 10px;
    }

    .step-number-badge {
      width: 30px;
      height: 30px;
      font-size: 0.9rem;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
</style>