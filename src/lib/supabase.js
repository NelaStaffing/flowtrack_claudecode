import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching projects:', error)
    return { data, error }
  },

  async getProject(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) console.error('Error fetching project:', error)
    return { data, error }
  },

  async createProject(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()

    if (error) console.error('Error creating project:', error)
    return { data, error }
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating project:', error)
    return { data, error }
  },

  // Tasks
  async getTasks(projectId = null) {
    let query = supabase
      .from('tasks')
      .select('*, projects(*)')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
    if (error) console.error('Error fetching tasks:', error)
    return { data, error }
  },

  async createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()

    if (error) console.error('Error creating task:', error)
    return { data, error }
  },

  async updateTask(id, updates) {
    const { data, error} = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating task:', error)
    return { data, error }
  },

  // Milestones
  async getMilestones(projectId) {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true })

    if (error) console.error('Error fetching milestones:', error)
    return { data, error }
  },

  // Blockers
  async getBlockers(status = 'active') {
    const { data, error } = await supabase
      .from('blockers')
      .select('*, projects(*)')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching blockers:', error)
    return { data, error }
  },

  async createBlocker(blocker) {
    const { data, error } = await supabase
      .from('blockers')
      .insert([blocker])
      .select()

    if (error) console.error('Error creating blocker:', error)
    return { data, error }
  },

  // Activity
  async getActivity(limit = 50) {
    const { data, error } = await supabase
      .from('activity')
      .select('*, users(*), projects(*)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) console.error('Error fetching activity:', error)
    return { data, error }
  },

  async logActivity(activity) {
    const { data, error } = await supabase
      .from('activity')
      .insert([activity])
      .select()

    if (error) console.error('Error logging activity:', error)
    return { data, error }
  }
}

export default supabase
