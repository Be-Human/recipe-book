import { writable } from 'svelte/store'

const STORAGE_KEY = 'recipe-book-recipes'

const createRecipeStore = () => {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    load: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          set(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Failed to load recipes:', e)
        set([])
      }
    },
    add: (recipe) => {
      const newRecipe = {
        ...recipe,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      update(recipes => {
        const updated = [...recipes, newRecipe]
        saveToStorage(updated)
        return updated
      })
    },
    update: (id, recipe) => {
      update(recipes => {
        const updated = recipes.map(r => 
          r.id === id 
            ? { ...r, ...recipe, updatedAt: new Date().toISOString() }
            : r
        )
        saveToStorage(updated)
        return updated
      })
    },
    delete: (id) => {
      update(recipes => {
        const updated = recipes.filter(r => r.id !== id)
        saveToStorage(updated)
        return updated
      })
    },
    getById: (id) => {
      let recipe = null
      subscribe(recipes => {
        recipe = recipes.find(r => r.id === id)
      })()
      return recipe
    }
  }
}

function saveToStorage(recipes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  } catch (e) {
    console.error('Failed to save recipes:', e)
  }
}

export const recipeStore = createRecipeStore()

export function loadRecipes() {
  recipeStore.load()
}

export function getCategories(recipes) {
  const categories = new Set()
  recipes.forEach(recipe => {
    if (recipe.category) {
      categories.add(recipe.category)
    }
  })
  return Array.from(categories).sort()
}

export function filterRecipes(recipes, searchKeyword, selectedCategory) {
  return recipes.filter(recipe => {
    const matchesSearch = searchKeyword 
      ? recipe.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchKeyword.toLowerCase()))
      : true
    
    const matchesCategory = selectedCategory && selectedCategory !== 'all'
      ? recipe.category === selectedCategory
      : true
    
    return matchesSearch && matchesCategory
  })
}