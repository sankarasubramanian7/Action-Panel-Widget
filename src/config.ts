import { type ImmutableObject } from 'jimu-core'

export interface Config {
  panelTitle: string
}

export type IMConfig = ImmutableObject<Config>
