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

    if (error) {
      console.error('Error fetching projects:', error.message, error)
    }
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
    if (error) {
      console.error('Error fetching tasks:', error.message, error)
    }
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
  },

  // Clients
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching clients:', error)
    return { data, error }
  },

  async getClient(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) console.error('Error fetching client:', error)
    return { data, error }
  },

  async createClient(client) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()

    if (error) console.error('Error creating client:', error)
    return { data, error }
  },

  async updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating client:', error)
    return { data, error }
  },

  async deleteClient(id) {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting client:', error)
    return { data, error }
  },

  // Client Contacts
  async getClientContacts(clientId) {
    const { data, error } = await supabase
      .from('client_contacts')
      .select('*')
      .eq('client_id', clientId)
      .order('is_primary', { ascending: false })

    if (error) console.error('Error fetching client contacts:', error)
    return { data, error }
  },

  async createClientContact(contact) {
    const { data, error } = await supabase
      .from('client_contacts')
      .insert([contact])
      .select()

    if (error) console.error('Error creating client contact:', error)
    return { data, error }
  },

  async updateClientContact(id, updates) {
    const { data, error } = await supabase
      .from('client_contacts')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating client contact:', error)
    return { data, error }
  },

  async deleteClientContact(id) {
    const { data, error } = await supabase
      .from('client_contacts')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting client contact:', error)
    return { data, error }
  },

  // Stakeholders
  async getStakeholders(clientId = null) {
    let query = supabase
      .from('stakeholders')
      .select('*, clients(name, logo, logo_color)')
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query
    if (error) console.error('Error fetching stakeholders:', error)
    return { data, error }
  },

  async getStakeholder(id) {
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*, clients(name, logo, logo_color)')
      .eq('id', id)
      .single()

    if (error) console.error('Error fetching stakeholder:', error)
    return { data, error }
  },

  async createStakeholder(stakeholder) {
    const { data, error } = await supabase
      .from('stakeholders')
      .insert([stakeholder])
      .select()

    if (error) console.error('Error creating stakeholder:', error)
    return { data, error }
  },

  async updateStakeholder(id, updates) {
    const { data, error } = await supabase
      .from('stakeholders')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating stakeholder:', error)
    return { data, error }
  },

  async deleteStakeholder(id) {
    const { data, error } = await supabase
      .from('stakeholders')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting stakeholder:', error)
    return { data, error }
  },

  // Stakeholder Interactions
  async getStakeholderInteractions(stakeholderId) {
    const { data, error } = await supabase
      .from('stakeholder_interactions')
      .select('*')
      .eq('stakeholder_id', stakeholderId)
      .order('interaction_date', { ascending: false })

    if (error) console.error('Error fetching stakeholder interactions:', error)
    return { data, error }
  },

  async createStakeholderInteraction(interaction) {
    const { data, error } = await supabase
      .from('stakeholder_interactions')
      .insert([interaction])
      .select()

    if (error) console.error('Error creating stakeholder interaction:', error)
    return { data, error }
  },

  // Documents (Knowledge Base)
  async getDocuments(filters = {}) {
    let query = supabase
      .from('knowledge_base')
      .select('*, projects(*)')
      .order('updated_at', { ascending: false })

    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId)
    }

    if (filters.taskId) {
      query = query.eq('task_id', filters.taskId)
    }

    if (filters.docType) {
      query = query.eq('doc_type', filters.docType)
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy)
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) console.error('Error fetching documents:', error)
    return { data, error }
  },

  async getDocument(id) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*, projects(*)')
      .eq('id', id)
      .single()

    if (error) console.error('Error fetching document:', error)
    return { data, error }
  },

  async getDocumentByTask(taskId) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*, projects(*)')
      .eq('task_id', taskId)
      .maybeSingle()

    if (error) console.error('Error fetching task document:', error)
    return { data, error }
  },

  async createDocument(document) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([document])
      .select()

    if (error) console.error('Error creating document:', error)
    return { data, error }
  },

  async updateDocument(id, updates) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) console.error('Error updating document:', error)
    return { data, error }
  },

  async deleteDocument(id) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting document:', error)
    return { data, error }
  },

  // Document Templates
  async getDocumentTemplates() {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_system', { ascending: false }) // System templates first
      .order('name', { ascending: true })

    if (error) console.error('Error fetching document templates:', error)
    return { data, error }
  },

  async getDocumentTemplate(id) {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) console.error('Error fetching document template:', error)
    return { data, error }
  }
}

export default supabase
