/* eslint-disable react/no-unused-class-component-methods */
import { React, Immutable, type UseDataSource, DataSourceTypes } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'


export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, unknown> {

  // Only allow WebMap data source
  supportedTypes = Immutable([DataSourceTypes.WebMap])

  // Handle data source (optional, safe to keep)
  onDataSourceSelected = (useDataSources: UseDataSource[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources
    })
  }

  // Map widget selection
  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds
    })
  }

  render () {

    const sectionStyle: React.CSSProperties = {
      marginBottom: 20,
      padding: 16,
      borderRadius: 10
    }

    const labelStyle: React.CSSProperties = {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 8,
      display: 'block'
    }

    return (
      <div className="action-panel-setting p-2">

        {/*Map Widget Selector */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Select Map Widget</label>
          <MapWidgetSelector
            useMapWidgetIds={this.props.useMapWidgetIds}
            onSelect={this.onMapWidgetSelected}
          />
        </div>
      </div>
    )
  }
}