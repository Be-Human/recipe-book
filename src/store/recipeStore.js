import { writable } from 'svelte/store'

const STORAGE_KEY = 'recipe-book-recipes'
const CATEGORIES_KEY = 'recipe-book-categories'
const COOKING_HISTORY_KEY = 'recipe-book-cooking-history'
const MEAL_PLAN_KEY = 'recipe-book-meal-plan'

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
            nutrition: {
              calories: null,
              protein: null,
              fat: null,
              carbs: null
            },
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
        rating: recipe.rating || null,
        nutrition: recipe.nutrition || {
          calories: null,
          protein: null,
          fat: null,
          carbs: null
        }
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
    deleteMultiple: (ids) => {
      update(recipes => {
        const updated = recipes.filter(r => !ids.includes(r.id))
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
    },
    importRecipes: (importedRecipes, onConflict) => {
      return new Promise((resolve) => {
        update(recipes => {
          let results = {
            imported: 0,
            skipped: 0,
            overwritten: 0,
            conflicts: []
          }

          const existingMap = new Map(recipes.map(r => [r.id, r]))
          let updatedRecipes = [...recipes]

          for (const imported of importedRecipes) {
            if (!imported.name) continue

            const existing = existingMap.get(imported.id)
            
            if (existing) {
              if (onConflict) {
                const action = onConflict(existing, imported)
                if (action === 'overwrite') {
                  const index = updatedRecipes.findIndex(r => r.id === imported.id)
                  if (index !== -1) {
                    updatedRecipes[index] = {
                      ...existing,
                      ...imported,
                      updatedAt: new Date().toISOString()
                    }
                  }
                  results.overwritten++
                } else {
                  results.skipped++
                }
              } else {
                results.conflicts.push({
                  existing,
                  imported
                })
              }
            } else {
              const newRecipe = {
                ...imported,
                createdAt: imported.createdAt || new Date().toISOString(),
                updatedAt: imported.updatedAt || new Date().toISOString()
              }
              updatedRecipes.push(newRecipe)
              results.imported++
            }
          }

          saveToStorage(updatedRecipes)
          set(updatedRecipes)
          resolve(results)
          return updatedRecipes
        })
      })
    },
    getAll: () => {
      let all = []
      subscribe(recipes => {
        all = [...recipes]
      })()
      return all
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

export function exportRecipeAsJson(recipe) {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    type: 'single',
    recipes: [recipe]
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `食谱-${recipe.name}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAllRecipesAsJson(recipes) {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    type: 'all',
    recipes: recipes
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `全部食谱-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseImportedJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    
    if (!parsed || !parsed.recipes || !Array.isArray(parsed.recipes)) {
      return { success: false, error: '无效的导入文件格式' }
    }
    
    const validRecipes = parsed.recipes.filter(r => r && r.name)
    
    if (validRecipes.length === 0) {
      return { success: false, error: '没有找到有效的食谱数据' }
    }
    
    return { success: true, recipes: validRecipes }
  } catch (e) {
    return { success: false, error: 'JSON 解析错误: ' + e.message }
  }
}

export const MEAL_TYPES = {
  breakfast: { label: '早餐', icon: '🌅' },
  lunch: { label: '午餐', icon: '☀️' },
  dinner: { label: '晚餐', icon: '🌙' }
}

export function formatDateKey(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function getWeekDates(startDate = new Date()) {
  const dates = []
  const start = new Date(startDate)
  const dayOfWeek = start.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  start.setDate(start.getDate() + mondayOffset)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push({
      date: date,
      dateKey: formatDateKey(date),
      dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      isToday: formatDateKey(date) === formatDateKey(new Date())
    })
  }
  return dates
}

function saveMealPlanToStorage(plan) {
  try {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan))
  } catch (e) {
    console.error('Failed to save meal plan:', e)
  }
}

const createMealPlanStore = () => {
  const { subscribe, set, update } = writable({})

  return {
    subscribe,
    load: () => {
      try {
        const stored = localStorage.getItem(MEAL_PLAN_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          set(parsed)
        }
      } catch (e) {
        console.error('Failed to load meal plan:', e)
        set({})
      }
    },
    addMeal: (dateKey, mealType, recipeId) => {
      update(plan => {
        const newPlan = { ...plan }
        if (!newPlan[dateKey]) {
          newPlan[dateKey] = { breakfast: [], lunch: [], dinner: [] }
        }
        if (!newPlan[dateKey][mealType]) {
          newPlan[dateKey][mealType] = []
        }
        if (!newPlan[dateKey][mealType].includes(recipeId)) {
          newPlan[dateKey][mealType] = [...newPlan[dateKey][mealType], recipeId]
        }
        saveMealPlanToStorage(newPlan)
        return newPlan
      })
    },
    removeMeal: (dateKey, mealType, recipeId) => {
      update(plan => {
        const newPlan = { ...plan }
        if (newPlan[dateKey] && newPlan[dateKey][mealType]) {
          newPlan[dateKey][mealType] = newPlan[dateKey][mealType].filter(id => id !== recipeId)
        }
        saveMealPlanToStorage(newPlan)
        return newPlan
      })
    },
    clearDay: (dateKey) => {
      update(plan => {
        const newPlan = { ...plan }
        delete newPlan[dateKey]
        saveMealPlanToStorage(newPlan)
        return newPlan
      })
    },
    clearAll: () => {
      set({})
      try {
        localStorage.removeItem(MEAL_PLAN_KEY)
      } catch (e) {
        console.error('Failed to clear meal plan:', e)
      }
    },
    getDayPlan: (dateKey) => {
      let plan = null
      subscribe(currentPlan => {
        plan = currentPlan[dateKey] || { breakfast: [], lunch: [], dinner: [] }
      })()
      return plan
    }
  }
}

export const mealPlanStore = createMealPlanStore()

export function loadMealPlan() {
  mealPlanStore.load()
}