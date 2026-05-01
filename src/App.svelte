<script>
  import RecipeList from './components/RecipeList.svelte'
  import RecipeDetail from './components/RecipeDetail.svelte'
  import RecipeForm from './components/RecipeForm.svelte'
  import { recipeStore, loadRecipes } from './store/recipeStore.js'
  
  let currentView = 'list'
  let selectedRecipe = null
  
  loadRecipes()
  
  function handleViewRecipe(recipe) {
    selectedRecipe = recipe
    currentView = 'detail'
  }
  
  function handleEditRecipe(recipe) {
    selectedRecipe = recipe
    currentView = 'form'
  }
  
  function handleAddRecipe() {
    selectedRecipe = null
    currentView = 'form'
  }
  
  function handleSaveRecipe() {
    currentView = 'list'
    selectedRecipe = null
  }
  
  function handleBack() {
    currentView = 'list'
    selectedRecipe = null
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
    <RecipeList on:view={handleViewRecipe} />
  {:else if currentView === 'detail'}
    <RecipeDetail 
      recipe={selectedRecipe} 
      on:back={handleBack}
      on:edit={handleEditRecipe}
    />
  {:else if currentView === 'form'}
    <RecipeForm 
      recipe={selectedRecipe}
      on:save={handleSaveRecipe}
      on:cancel={handleBack}
    />
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
  }

  h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 2.5rem;
  }

  .add-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-weight: bold;
  }

  .add-btn:hover {
    background-color: #c0392b;
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
    
    h1 {
      font-size: 1.8rem;
    }
  }
</style>