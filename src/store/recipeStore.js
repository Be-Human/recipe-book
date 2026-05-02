import { writable } from 'svelte/store'

const STORAGE_KEY = 'recipe-book-recipes'
const CATEGORIES_KEY = 'recipe-book-categories'
const COOKING_HISTORY_KEY = 'recipe-book-cooking-history'

export const DIFFICULTIES = ['简单', '中等', '困难']

export const DEFAULT_CATEGORIES = [
  '中式料理',
  '西式料理', 
  '日式料理',
  '韩式料理',
  '甜点',
  '汤品',
  '主食',
  '其他'
]

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
            rating: null,
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
        coverImage: recipe.coverImage || '',
        rating: recipe.rating || null
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

const createCategoryStore = () => {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    load: () => {
      try {
        const stored = localStorage.getItem(CATEGORIES_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          set(parsed)
        } else {
          set([...DEFAULT_CATEGORIES])
        }
      } catch (e) {
        console.error('Failed to load categories:', e)
        set([...DEFAULT_CATEGORIES])
      }
    },
    add: (category) => {
      update(categories => {
        const trimmed = category.trim()
        if (!trimmed || categories.includes(trimmed)) {
          return categories
        }
        const updated = [...categories, trimmed].sort()
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
        return updated
      })
    },
    delete: (category) => {
      update(categories => {
        const updated = categories.filter(c => c !== category)
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
        return updated
      })
    },
    rename: (oldName, newName) => {
      const trimmed = newName.trim()
      if (!trimmed || oldName === trimmed) return
      update(categories => {
        const updated = categories.map(c => c === oldName ? trimmed : c)
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
        return updated
      })
    },
    isUsed: (category, recipes) => {
      return recipes.some(r => r.category === category)
    },
    getUsedCount: (category, recipes) => {
      return recipes.filter(r => r.category === category).length
    }
  }
}

export const categoryStore = createCategoryStore()

export function loadCategories() {
  categoryStore.load()
}

const createCookingHistoryStore = () => {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,
    load: () => {
      try {
        const stored = localStorage.getItem(COOKING_HISTORY_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          set(parsed)
        }
      } catch (e) {
        console.error('Failed to load cooking history:', e)
        set([])
      }
    },
    add: (recipeId, note = '') => {
      const entry = {
        id: Date.now().toString(),
        recipeId,
        cookedAt: new Date().toISOString(),
        note: note.trim()
      }
      update(history => {
        const updated = [entry, ...history]
        localStorage.setItem(COOKING_HISTORY_KEY, JSON.stringify(updated))
        return updated
      })
      return entry
    },
    updateNote: (historyId, note) => {
      update(history => {
        const updated = history.map(h => 
          h.id === historyId 
            ? { ...h, note: note.trim(), updatedAt: new Date().toISOString() }
            : h
        )
        localStorage.setItem(COOKING_HISTORY_KEY, JSON.stringify(updated))
        return updated
      })
    },
    delete: (historyId) => {
      update(history => {
        const updated = history.filter(h => h.id !== historyId)
        localStorage.setItem(COOKING_HISTORY_KEY, JSON.stringify(updated))
        return updated
      })
    },
    getByRecipeId: (recipeId) => {
      let history = []
      subscribe(h => {
        history = h.filter(item => item.recipeId === recipeId)
      })()
      return history
    }
  }
}

export const cookingHistoryStore = createCookingHistoryStore()

export function loadCookingHistory() {
  cookingHistoryStore.load()
}