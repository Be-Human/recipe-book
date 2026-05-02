<script>
  import { createEventDispatcher } from 'svelte'
  import { recipeStore, categoryStore, DIFFICULTIES } from '../store/recipeStore.js'
  
  export let recipe
  
  const dispatch = createEventDispatcher()
  const isEdit = !!recipe
  
  let formData = {
    name: recipe?.name || '',
    category: recipe?.category || '',
    cookingTime: recipe?.cookingTime || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients?.map(ing => ({ ...ing })) || [{ name: '', amount: '' }],
    steps: recipe?.steps?.map(step => ({ ...step })) || [{ description: '', tip: '' }],
    coverImage: recipe?.coverImage || '',
    difficulty: recipe?.difficulty || '中等',
    servings: recipe?.servings || 2,
    rating: recipe?.rating || null
  }
  
  function isBase64Image(image) {
    return image && image.startsWith('data:image')
  }
  
  let coverImageInputType = isBase64Image(formData.coverImage) ? 'upload' : 'url'
  let imagePreview = formData.coverImage || ''
  let errors = {}
  
  function handleImageUpload(event) {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview = e.target?.result
        formData.coverImage = e.target?.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  function clearImage() {
    imagePreview = ''
    formData.coverImage = ''
  }
  
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
    
    if (formData.servings && (isNaN(parseInt(formData.servings)) || parseInt(formData.servings) < 1)) {
      errors.servings = '份量人数必须是大于0的数字'
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
      steps: formData.steps.filter(step => step.description.trim()),
      coverImage: formData.coverImage,
      difficulty: formData.difficulty,
      servings: formData.servings ? parseInt(formData.servings) : 2,
      rating: formData.rating
    }
    
    if (isEdit) {
      recipeStore.update(recipe.id, recipeData)
    } else {
      recipeStore.add(recipeData)
    }
    
    dispatch('save')
  }
  
  function setRating(stars) {
    if (formData.rating === stars) {
      formData.rating = null
    } else {
      formData.rating = stars
    }
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
              {#each $categoryStore as category}
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

        <div class="form-row">
          <div class="form-group">
            <label for="difficulty" class="form-label">
              难度等级
            </label>
            <select
              id="difficulty"
              bind:value={formData.difficulty}
              class="form-select"
            >
              {#each DIFFICULTIES as difficulty}
                <option value={difficulty}>{difficulty}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="servings" class="form-label">
              份量人数
            </label>
            <input
              type="number"
              id="servings"
              bind:value={formData.servings}
              class="form-input {errors.servings ? 'error' : ''}"
              placeholder="例如：2"
              min="1"
            />
            {#if errors.servings}
              <span class="error-message">{errors.servings}</span>
            {/if}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            星级评分
          </label>
          <div class="rating-input">
            {#each [1, 2, 3, 4, 5] as star}
              <button
                type="button"
                class="star-btn {formData.rating >= star ? 'active' : ''}"
                on:click={() => setRating(star)}
              >
                {formData.rating >= star ? '★' : '☆'}
              </button>
            {/each}
            <span class="rating-text">
              {formData.rating ? `${formData.rating} 星` : '点击星星评分'}
            </span>
          </div>
        </div>

        <fieldset class="form-group">
          <legend class="form-label">
            封面图
          </legend>
          <div class="cover-image-section">
            <div class="input-type-tabs">
              <button
                type="button"
                class="tab-btn {coverImageInputType === 'upload' ? 'active' : ''}"
                on:click={() => coverImageInputType = 'upload'}
              >
                📤 上传图片
              </button>
              <button
                type="button"
                class="tab-btn {coverImageInputType === 'url' ? 'active' : ''}"
                on:click={() => coverImageInputType = 'url'}
              >
                🔗 图片链接
              </button>
            </div>

            {#if coverImageInputType === 'upload'}
              <div class="upload-area">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  on:change={handleImageUpload}
                  class="file-input"
                />
                <label for="imageUpload" class="upload-label">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">点击或拖拽上传图片</span>
                </label>
              </div>
            {:else}
              <input
                type="url"
                id="coverImageUrl"
                bind:value={formData.coverImage}
                on:input={() => imagePreview = formData.coverImage}
                class="form-input"
                placeholder="请输入图片 URL 地址，例如：https://example.com/image.jpg"
              />
            {/if}

            {#if imagePreview}
              <div class="image-preview-container">
                <div class="image-preview-wrapper">
                  <img src={imagePreview} alt="封面预览" class="image-preview" />
                  <button
                    type="button"
                    class="clear-image-btn"
                    on:click={clearImage}
                  >
                    ✕
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </fieldset>
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

  .form-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .form-content {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 32px;
  }

  .form-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
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
    gap: 12px;
  }

  .section-title {
    margin: 0 0 20px 0;
    color: var(--text-primary);
    font-size: 1.15rem;
    font-weight: 600;
  }

  .section-header .section-title {
    margin-bottom: 0;
  }

  .required {
    color: #FF4757;
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
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    transition: var(--transition);
    font-family: inherit;
    background: var(--bg-gradient-1);
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .form-input.error,
  .form-select.error {
    border-color: #FF4757;
    background: #FFF5F5;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.6;
  }

  .error-message {
    display: inline-block;
    margin-top: 6px;
    color: #FF4757;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .error-message.block {
    display: block;
    margin: 0 0 15px 0;
    padding: 10px 14px;
    background: #FFF5F5;
    border-radius: var(--radius-sm);
    border-left: 3px solid #FF4757;
  }

  .rating-input {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
  }

  .star-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: var(--text-light);
    transition: var(--transition);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }

  .star-btn:hover {
    transform: scale(1.2);
    color: #FFD700;
  }

  .star-btn.active {
    color: #FFD700;
  }

  .rating-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-left: 8px;
  }

  .add-item-btn {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
    border: none;
    padding: 10px 18px;
    font-size: 0.9rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }

  .add-item-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }

  .item-row:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .item-number {
    color: var(--text-secondary);
    font-weight: 600;
    min-width: 28px;
    font-size: 0.95rem;
  }

  .amount-input {
    max-width: 150px;
  }

  .steps-form-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .step-form-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-md);
    transition: var(--transition);
  }

  .step-form-row:hover {
    background: var(--card-bg);
    box-shadow: var(--shadow-sm);
  }

  .step-number-badge {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(255, 107, 53, 0.3);
  }

  .step-form-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tip-input {
    background: #FFF9E6;
  }

  .tip-input:focus {
    background: #FFFDF5;
  }

  .remove-btn {
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 6px;
    opacity: 0.5;
    transition: var(--transition);
    border-radius: var(--radius-sm);
  }

  .remove-btn:hover:not(:disabled) {
    opacity: 1;
    background: #FFF5F5;
  }

  .remove-btn:disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }

  .cover-image-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .input-type-tabs {
    display: flex;
    gap: 8px;
  }

  .tab-btn {
    padding: 10px 20px;
    border: 2px solid var(--border-color);
    background: var(--bg-gradient-1);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--transition);
  }

  .tab-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .tab-btn.active {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-color: var(--primary);
    color: white;
    box-shadow: var(--shadow-sm);
  }

  .upload-area {
    position: relative;
  }

  .file-input {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
  }

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-gradient-1);
    cursor: pointer;
    transition: var(--transition);
  }

  .upload-label:hover {
    border-color: var(--primary);
    background: white;
  }

  .upload-icon {
    font-size: 2.5rem;
  }

  .upload-text {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .image-preview-container {
    display: flex;
    justify-content: center;
  }

  .image-preview-wrapper {
    position: relative;
    display: inline-block;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .image-preview {
    max-width: 100%;
    max-height: 250px;
    object-fit: cover;
    display: block;
  }

  .clear-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }

  .clear-image-btn:hover {
    background: #FF4757;
    transform: scale(1.1);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }

  .cancel-btn,
  .save-btn {
    padding: 14px 28px;
    border: none;
    border-radius: var(--radius-md);
    font-size: 1rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    box-shadow: var(--shadow-sm);
  }

  .cancel-btn {
    background: var(--border-color);
    color: var(--text-primary);
  }

  .cancel-btn:hover {
    background: var(--text-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .save-btn {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
  }

  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
  }

  @media (max-width: 768px) {
    .form-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .back-btn {
      text-align: center;
    }

    .form-title {
      font-size: 1.3rem;
      text-align: center;
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

    .add-item-btn {
      width: 100%;
    }

    .item-row {
      flex-wrap: wrap;
      padding: 12px;
    }

    .item-number {
      order: -1;
      width: 100%;
      margin-bottom: 4px;
    }

    .amount-input {
      max-width: none;
      flex: 1;
    }

    .step-form-row {
      gap: 12px;
      padding: 14px;
    }

    .step-number-badge {
      width: 32px;
      height: 32px;
      font-size: 0.95rem;
    }

    .input-type-tabs {
      flex-direction: column;
    }

    .tab-btn {
      width: 100%;
      text-align: center;
    }

    .upload-label {
      padding: 24px;
    }

    .form-actions {
      flex-direction: column-reverse;
      gap: 12px;
    }

    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
</style>