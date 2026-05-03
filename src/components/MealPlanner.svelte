<script>
  import { createEventDispatcher } from 'svelte'
  import { 
    recipeStore, 
    mealPlanStore, 
    MEAL_TYPES, 
    getWeekDates, 
    formatDateKey 
  } from '../store/recipeStore.js'
  import RecipeSelector from './RecipeSelector.svelte'
  
  const dispatch = createEventDispatcher()
  
  let currentWeekStart = new Date()
  let showSelector = false
  let selectedDateKey = null
  let selectedMealType = null
  
  $: weekDates = getWeekDates(currentWeekStart)
  $: mealPlan = $mealPlanStore
  
  function handleBack() {
    dispatch('back')
  }
  
  function prevWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    currentWeekStart = newDate
  }
  
  function nextWeek() {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    currentWeekStart = newDate
  }
  
  function goToToday() {
    currentWeekStart = new Date()
  }
  
  function openSelector(dateKey, mealType) {
    selectedDateKey = dateKey
    selectedMealType = mealType
    showSelector = true
  }
  
  function closeSelector() {
    showSelector = false
    selectedDateKey = null
    selectedMealType = null
  }
  
  function handleSelectRecipe(recipeId) {
    if (selectedDateKey && selectedMealType) {
      mealPlanStore.addMeal(selectedDateKey, selectedMealType, recipeId)
    }
    closeSelector()
  }
  
  function removeMeal(dateKey, mealType, recipeId) {
    if (confirm('确定要移除这个食谱吗？')) {
      mealPlanStore.removeMeal(dateKey, mealType, recipeId)
    }
  }
  
  function clearDay(dateKey) {
    if (confirm('确定要清除这一天的所有安排吗？')) {
      mealPlanStore.clearDay(dateKey)
    }
  }
  
  function clearAll() {
    if (confirm('确定要清除所有餐单计划吗？此操作不可恢复。')) {
      mealPlanStore.clearAll()
    }
  }
  
  function getRecipeById(id) {
    return $recipeStore.find(r => r.id === id)
  }
  
  function getMealsForDay(dateKey) {
    return mealPlan[dateKey] || { breakfast: [], lunch: [], dinner: [] }
  }
  
  function hasMealsForDay(dateKey) {
    const dayMeals = getMealsForDay(dateKey)
    return dayMeals.breakfast.length > 0 || 
           dayMeals.lunch.length > 0 || 
           dayMeals.dinner.length > 0
  }
  
  function formatDateDisplay(date) {
    const d = new Date(date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
</script>

<div class="meal-planner">
  <div class="planner-header">
    <button class="back-btn" on:click={handleBack}>
      ← 返回列表
    </button>
    <h1 class="planner-title">📅 餐单计划</h1>
  </div>

  <div class="week-controls">
    <button class="nav-btn" on:click={prevWeek}>
      ← 上一周
    </button>
    <div class="week-display">
      <span class="week-range">
        {formatDateDisplay(weekDates[0]?.date)} - {formatDateDisplay(weekDates[6]?.date)}
      </span>
      <button class="today-btn" on:click={goToToday}>
        今天
      </button>
    </div>
    <button class="nav-btn" on:click={nextWeek}>
      下一周 →
    </button>
  </div>

  <div class="planner-actions">
    <button class="action-btn clear-all" on:click={clearAll}>
      🗑️ 清除全部计划
    </button>
  </div>

  <div class="week-grid">
    {#each weekDates as day (day.dateKey)}
      <div class="day-column" class:today={day.isToday}>
        <div class="day-header">
          <div class="day-info">
            <span class="day-name">{day.dayName}</span>
            <span class="day-date">{formatDateDisplay(day.date)}</span>
          </div>
          {#if hasMealsForDay(day.dateKey)}
            <button 
              class="clear-day-btn"
              on:click={() => clearDay(day.dateKey)}
              title="清除当天安排"
            >
              ✕
            </button>
          {/if}
        </div>
        
        <div class="day-meals">
          {#each Object.entries(MEAL_TYPES) as [mealType, mealInfo]}
            <div class="meal-section">
              <div class="meal-header">
                <span class="meal-icon">{mealInfo.icon}</span>
                <span class="meal-label">{mealInfo.label}</span>
                <button 
                  class="add-meal-btn"
                  on:click={() => openSelector(day.dateKey, mealType)}
                  title="添加食谱"
                >
                  +
                </button>
              </div>
              
              <div class="meal-recipes">
                {#if getMealsForDay(day.dateKey)[mealType]?.length > 0}
                  {#each getMealsForDay(day.dateKey)[mealType] as recipeId}
                    {#if getRecipeById(recipeId)}
                      <div class="recipe-item">
                        <span class="recipe-name">{getRecipeById(recipeId).name}</span>
                        <button 
                          class="remove-recipe-btn"
                          on:click={() => removeMeal(day.dateKey, mealType, recipeId)}
                          title="移除"
                        >
                          ✕
                        </button>
                      </div>
                    {/if}
                  {/each}
                {:else}
                  <div class="empty-meal">
                    <span class="empty-text">点击 + 添加</span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

{#if showSelector}
  <RecipeSelector 
    on:select={(e) => handleSelectRecipe(e.detail)}
    on:cancel={closeSelector}
  />
{/if}

<style>
  .meal-planner {
    width: 100%;
  }

  .planner-header {
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

  .planner-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .week-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .nav-btn {
    padding: 10px 20px;
    border: 2px solid var(--border-color);
    background: var(--bg-gradient-1);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .nav-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .week-display {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .week-range {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .today-btn {
    padding: 8px 16px;
    border: none;
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
  }

  .today-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .planner-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

  .action-btn {
    padding: 10px 18px;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    border: none;
  }

  .action-btn.clear-all {
    background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
    color: white;
    box-shadow: 0 3px 10px rgba(255, 71, 87, 0.3);
  }

  .action-btn.clear-all:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 71, 87, 0.4);
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
  }

  .day-column {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: var(--transition);
  }

  .day-column.today {
    box-shadow: 0 0 0 3px var(--primary), var(--shadow-md);
  }

  .day-header {
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .day-column.today .day-header {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
  }

  .day-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .day-name {
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .day-date {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .clear-day-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    transition: var(--transition);
  }

  .clear-day-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .day-meals {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .meal-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--bg-gradient-1);
    border-radius: var(--radius-sm);
  }

  .meal-icon {
    font-size: 1rem;
  }

  .meal-label {
    flex: 1;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .add-meal-btn {
    width: 22px;
    height: 22px;
    border: 2px dashed var(--border-color);
    background: white;
    color: var(--text-light);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: var(--transition);
    padding: 0;
  }

  .add-meal-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: #FFF5F0;
  }

  .meal-recipes {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .empty-meal {
    padding: 8px 10px;
    text-align: center;
  }

  .empty-text {
    color: var(--text-light);
    font-size: 0.75rem;
  }

  .recipe-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: linear-gradient(135deg, #FFF5F0 0%, #FFEDE6 100%);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--primary);
    transition: var(--transition);
  }

  .recipe-item:hover {
    background: linear-gradient(135deg, #FFEDE6 0%, #FFE0D4 100%);
    transform: translateX(2px);
  }

  .recipe-name {
    color: var(--text-primary);
    font-size: 0.85rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .remove-recipe-btn {
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    transition: var(--transition);
    opacity: 0.6;
  }

  .remove-recipe-btn:hover {
    color: #FF4757;
    background: rgba(255, 71, 87, 0.1);
    opacity: 1;
  }

  @media (max-width: 1200px) {
    .week-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 768px) {
    .planner-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .back-btn {
      text-align: center;
    }

    .planner-title {
      text-align: center;
      font-size: 1.3rem;
    }

    .week-controls {
      padding: 16px;
      flex-direction: column;
      gap: 12px;
    }

    .nav-btn {
      width: 100%;
    }

    .week-display {
      width: 100%;
      justify-content: center;
    }

    .planner-actions {
      justify-content: center;
    }

    .action-btn {
      width: 100%;
    }

    .week-grid {
      grid-template-columns: 1fr;
    }

    .day-column {
      margin-bottom: 0;
    }

    .day-meals {
      padding: 16px;
    }

    .meal-section {
      gap: 10px;
    }

    .meal-recipes {
      gap: 8px;
    }

    .recipe-item {
      padding: 10px 12px;
    }

    .recipe-name {
      font-size: 0.9rem;
    }
  }
</style>