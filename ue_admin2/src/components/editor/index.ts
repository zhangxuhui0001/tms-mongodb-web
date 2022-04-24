import DbEditor from './DbEditor.vue'
import CollectionEditor from './CollectionEditor.vue'
import TagEditor from './TagEditor.vue'
import ReplicaEditor from './ReplicaEditor.vue'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'

type DbEditorOptions = {
  mode: any
  bucketName?: any
  database?: any
  onBeforeClose: Function
}

type CollectionEditorOptions = {
  mode: any
  bucketName?: any
  dbName: string
  collection?: any
  onBeforeClose: Function
}

type TagEditorOptions = {
  mode: any
  bucketName?: any
  tag?: any
  onBeforeClose: Function
}

type ReplicaEditorOptions = {
  bucketName?: any
  replica?: any
  onBeforeClose: Function
}

export function openDbEditor(options: DbEditorOptions) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const { mode, bucketName, database, onBeforeClose } = options
  let app = createApp(DbEditor, {
    mode,
    bucketName,
    database,
    onClose: (newDb: any) => {
      if (newDb && onBeforeClose) onBeforeClose(newDb)
      app.unmount()
      document.body.removeChild(root)
    },
  })
  app.use(ElementPlus).mount(root)
}

export function openCollectionEditor(options: CollectionEditorOptions) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const { mode, bucketName, dbName, collection, onBeforeClose } = options
  let app = createApp(CollectionEditor, {
    mode,
    bucketName,
    dbName,
    collection,
    onClose: (newCl: any) => {
      if (newCl && onBeforeClose) onBeforeClose(newCl)
      app.unmount()
      document.body.removeChild(root)
    },
  })
  app.use(ElementPlus).mount(root)
}

export function openTagEditor(options: TagEditorOptions) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const { mode, bucketName, tag, onBeforeClose } = options
  let app = createApp(TagEditor, {
    mode,
    bucketName,
    tag,
    onClose: (newDb: any) => {
      if (newDb && onBeforeClose) onBeforeClose(newDb)
      app.unmount()
      document.body.removeChild(root)
    },
  })
  app.use(ElementPlus).mount(root)
}

export function openReplicaEditor(options: ReplicaEditorOptions) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const { bucketName, replica, onBeforeClose } = options
  let app = createApp(ReplicaEditor, {
    bucketName,
    replica,
    onClose: (newReplica: any) => {
      if (newReplica && onBeforeClose) onBeforeClose(newReplica)
      app.unmount()
      document.body.removeChild(root)
    },
  })
  app.use(ElementPlus).mount(root)
}