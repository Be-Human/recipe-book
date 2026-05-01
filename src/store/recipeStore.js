import { writable } from 'svelte/store'

const STORAGE_KEY = 'recipe-book-recipes'

export const DIFFICULTIES = ['简单', '中等', '困难']

export const SORT_OPTIONS = [
  { value: 'name', label: '名称' },
  { value: 'cookingTime', label: '烹饪时长' },
  { value: 'createdAt', label: '创建时间' }
]

const createRecipeStore = () => {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    load: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          const migrated = parsed.map(recipe => ({
            isFavorite: false,
            difficulty: '中等',
            servings: 2,
            coverImage: '',
            ...recipe
          }))
          set(migrated)
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
        updatedAt: new Date().toISOString(),
        isFavorite: recipe.isFavorite || false,
        difficulty: recipe.difficulty || '中等',
        servings: recipe.servings || 2,
        coverImage: recipe.coverImage || ''
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
    },
    toggleFavorite: (id) => {
      update(recipes => {
        const updated = recipes.map(r => 
          r.id === id 
            ? { ...r, isFavorite: !r.isFavorite, updatedAt: new Date().toISOString() }
            : r
        )
        saveToStorage(updated)
        return updated
      })
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

export function filterRecipes(recipes, searchKeyword, selectedCategory, showFavoritesOnly = false) {
  let filtered = recipes.filter(recipe => {
    const matchesSearch = searchKeyword 
      ? recipe.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchKeyword.toLowerCase()))
      : true
    
    const matchesCategory = selectedCategory && selectedCategory !== 'all'
      ? recipe.category === selectedCategory
      : true
    
    const matchesFavorite = showFavoritesOnly
      ? recipe.isFavorite
      : true
    
    return matchesSearch && matchesCategory && matchesFavorite
  })
  return filtered
}

export function sortRecipes(recipes, sortBy) {
  const sorted = [...recipes]
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
      break
    case 'cookingTime':
      sorted.sort((a, b) => {
        const timeA = a.cookingTime || 0
        const timeB = b.cookingTime || 0
        return timeA - timeB
      })
      break
    case 'createdAt':
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }
  return sorted
}