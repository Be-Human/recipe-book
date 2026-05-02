<script>
  import RecipeList from './components/RecipeList.svelte'
  import RecipeDetail from './components/RecipeDetail.svelte'
  import RecipeForm from './components/RecipeForm.svelte'
  import ShoppingList from './components/ShoppingList.svelte'
  import { recipeStore, loadRecipes } from './store/recipeStore.js'
  
  let currentView = 'list'
  let selectedRecipeId = null
  let selectedRecipesForShopping = []
  
  $: selectedRecipe = $recipeStore.find(r => r.id === selectedRecipeId) || null
  
  loadRecipes()
  
  function handleViewRecipe(recipe) {
    selectedRecipeId = recipe.id
    currentView = 'detail'
  }
  
  function handleEditRecipe(recipe) {
    selectedRecipeId = recipe.id
    currentView = 'form'
  }
  
  function handleAddRecipe() {
    selectedRecipeId = null
    currentView = 'form'
  }
  
  function handleSaveRecipe() {
    currentView = 'list'
    selectedRecipeId = null
  }
  
  function handleBack() {
    currentView = 'list'
    selectedRecipeId = null
    selectedRecipesForShopping = []
  }
  
  function handleGenerateShoppingList(event) {
    selectedRecipesForShopping = event.detail
    currentView = 'shopping'
  }
</script>

<main>
  <header>
    <h1>📖 食谱管理</h1>
    {#if currentView === 'list'}
      <button class="add-btn" on:click={handleAddRecipe}>
        + 添加食谱
      </button>
    {/if}
  </header>

  {#if currentView === 'list'}
    <RecipeList 
      on:view={(e) => handleViewRecipe(e.detail)}
      on:generateShoppingList={handleGenerateShoppingList}
    />
  {:else if currentView === 'detail'}
    <RecipeDetail 
      recipe={selectedRecipe} 
      on:back={handleBack}
      on:edit={(e) => handleEditRecipe(e.detail)}
    />
  {:else if currentView === 'form'}
    <RecipeForm 
      recipe={selectedRecipe}
      on:save={handleSaveRecipe}
      on:cancel={handleBack}
    />
  {:else if currentView === 'shopping'}
    <ShoppingList 
      recipes={selectedRecipesForShopping}
      on:back={handleBack}
    />
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 20px 24px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 700;
  }

  .add-btn {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    border: none;
    padding: 12px 28px;
    font-size: 0.95rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(255, 107, 53, 0.4);
  }

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
  }

  .add-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    main {
      padding: 16px;
    }

    header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      padding: 16px;
    }
    
    h1 {
      font-size: 1.5rem;
      text-align: center;
    }

    .add-btn {
      width: 100%;
    }
  }
</style>