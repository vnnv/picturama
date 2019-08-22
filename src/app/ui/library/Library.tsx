import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ipcRenderer } from 'electron'
import { Button, NonIdealState, Spinner, MaybeElement, Icon } from '@blueprintjs/core'

import { PhotoId, Photo, PhotoWork, PhotoSectionId, PhotoSectionById, PhotoDetail, PhotoFilterType } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import CancelablePromise from 'common/util/CancelablePromise'
import { bindMany } from 'common/util/LangUtil'

import { setDetailPhotoById } from 'app/controller/DetailController'
import { getThumbnailSrc } from 'app/controller/ImageProvider'
import { getGridLayout, setInfoPhoto, createThumbnail } from 'app/controller/LibraryController'
import { fetchTotalPhotoCount, fetchSections, setLibraryFilter, updatePhotoWork, setPhotosFlagged, movePhotosToTrash, restorePhotosFromTrash } from 'app/controller/PhotoController'
import { fetchTags, setPhotoTags } from 'app/controller/PhotoTagController'
import { setSelectedPhotosAction, openExportAction, setGridRowHeightAction } from 'app/state/actions'
import { AppState } from 'app/state/reducers'
import { getTagTitles } from 'app/state/selectors'
import { keySymbols } from 'app/UiConstants'
import { FetchState } from 'app/UITypes'
import PhotoInfo from 'app/ui/info/PhotoInfo'

import LibraryTopBar from './LibraryTopBar'
import LibraryBottomBar from './LibraryBottomBar'
import Grid, { GetGridLayoutFunction } from './Grid'

import './Library.less'


interface OwnProps {
    style?: any
    className?: any
    topBarLeftItem?: MaybeElement
    bottomBarLeftItem?: MaybeElement
    isActive: boolean
}

interface StateProps {
    hasPhotoDirs: boolean
    isFetching: boolean
    isImporting: boolean
    libraryFilterType: PhotoFilterType
    photoCount: number
    totalPhotoCount: number | null
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    selectedSectionId: PhotoSectionId | null
    selectedPhotoIds: PhotoId[]
    infoPhoto: Photo | null
    infoPhotoDetail: PhotoDetail | null
    tags: string[]
    gridRowHeight: number
}

interface DispatchProps {
    fetchTotalPhotoCount: () => void
    fetchSections: () => void
    fetchTags(): void
    getGridLayout: GetGridLayoutFunction
    getThumbnailSrc: (photo: Photo) => string
    createThumbnail: (sectionId: PhotoSectionId, photo: Photo) => CancelablePromise<string>
    setGridRowHeight: (gridRowHeight: number) => void
    setSelectedPhotos: (sectionId: PhotoSectionId | null, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
    setInfoPhoto: (sectionId: PhotoSectionId | null, photoId: PhotoId | null) => void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setPhotosFlagged: (photos: Photo[], flag: boolean) => void
    setPhotoTags: (photo: Photo, tags: string[]) => void
    updatePhotoWork: (photo: Photo, update: (photoWork: PhotoWork) => void) => void
    movePhotosToTrash: (photos: Photo[]) => void
    restorePhotosFromTrash: (photos: Photo[]) => void
    startScanning: () => void
}

export interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    isShowingInfo: boolean
}

export class Library extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { isShowingInfo: false }

        bindMany(this, 'openExport', 'clearHighlight', 'toggleShowInfo')
    }

    componentDidUpdate(prevProps: Props, prevState) {
        const props = this.props

        const isExportEnabled = props.isActive && props.selectedPhotoIds.length > 0
        const prevIsExportEnabled = prevProps.isActive && prevProps.selectedPhotoIds.length > 0
        if (isExportEnabled !== prevIsExportEnabled) {
            ipcRenderer.send('toggleExportMenu', isExportEnabled)
            if (isExportEnabled) {
                ipcRenderer.on('exportClicked', this.openExport)
            } else {
                ipcRenderer.removeAllListeners('exportClicked')
            }
        }
    }

    componentDidMount() {
        const { props } = this
        props.fetchTotalPhotoCount()
        props.fetchSections()
        props.fetchTags()
    }

    openExport() {
        const props = this.props
        if (props.selectedSectionId) {
            props.openExport(props.selectedSectionId, props.selectedPhotoIds)
        }
    }

    clearHighlight() {
        const props = this.props
        props.setSelectedPhotos(props.selectedSectionId, [])
    }

    toggleShowInfo() {
        this.setState({ isShowingInfo: !this.state.isShowingInfo })
    }

    updateInfoPhoto() {
        const props = this.props
        const state = this.state

        const infoPhotoId = (state.isShowingInfo && props.selectedPhotoIds.length !== 0)
            ? props.selectedPhotoIds[0]
            : null
        const propsInfoPhotoId = props.infoPhoto ? props.infoPhoto.id : null
        if (propsInfoPhotoId !== infoPhotoId) {
            props.setInfoPhoto(props.selectedSectionId, infoPhotoId)
        }
    }

    render() {
        const { props, state } = this
        const { selectedSectionId } = props

        this.updateInfoPhoto()

        let currentView
        if (props.totalPhotoCount === 0 && !props.isFetching && !props.isImporting) {
            if (!props.hasPhotoDirs) {
                const descriptionSplits = msg('Library_noSettings_message').split('{0}')
                currentView =
                    <NonIdealState
                        icon='zoom-out'
                        title={msg('Library_noPhotos_title')}
                        description={
                            <>
                                {descriptionSplits[0]}
                                <Icon icon='cog' style={{ verticalAlign: 'middle' }}/>
                                {descriptionSplits[1]}
                            </>
                        }
                    />
            } else {
                const descriptionSplits = msg('Library_noPhotos_message').split('{0}')
                currentView =
                    <NonIdealState
                        icon='zoom-out'
                        title={msg('Library_noPhotos_title')}
                        description={
                            <>
                                {descriptionSplits[0]}
                                <code>{keySymbols.ctrlOrMacCommand}</code>+<code>R</code>
                                {descriptionSplits[1]}
                            </>
                        }
                        action={
                            <div className="bp3-dark">
                                <Button onClick={props.startScanning}>{msg('Library_startScanning')}</Button>
                            </div>
                        }
                    />
            }
        } else if (props.photoCount === 0 && !props.isFetching && !props.isImporting) {
            let title: string
            switch (props.libraryFilterType) {
                case 'flagged': title = msg('Library_emptyFavorites'); break
                case 'trash':   title = msg('Library_emptyTrash'); break
                default:        title = msg('Library_emptyView'); break
            }

            currentView =
                <NonIdealState
                    icon={props.libraryFilterType === 'trash' ? 'tick' : 'zoom-out'}
                    title={title}
                    description={msg('Library_selectOtherView')}
                />
        } else {
            currentView =
                <Grid
                    className="Library-grid"
                    isActive={props.isActive}
                    sectionIds={props.sectionIds}
                    sectionById={props.sectionById}
                    selectedSectionId={selectedSectionId}
                    selectedPhotoIds={props.selectedPhotoIds}
                    gridRowHeight={props.gridRowHeight}
                    getGridLayout={props.getGridLayout}
                    getThumbnailSrc={props.getThumbnailSrc}
                    createThumbnail={props.createThumbnail}
                    setSelectedPhotos={props.setSelectedPhotos}
                    setDetailPhotoById={props.setDetailPhotoById}
                />
        }

        const photoData = selectedSectionId && props.sectionById[selectedSectionId].photoData
        const selectedPhotos = photoData ? props.selectedPhotoIds.map(photoId => photoData[photoId]) : []

        return (
            <div
                ref="library"
                className={classNames(props.className, 'Library', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                <LibraryTopBar
                    className="Library-topBar"
                    leftItem={props.topBarLeftItem}
                    selectedSectionId={selectedSectionId}
                    selectedPhotos={selectedPhotos}
                    isShowingTrash={props.libraryFilterType === 'trash'}
                    isShowingInfo={state.isShowingInfo}
                    photosCount={props.photoCount}
                    openExport={props.openExport}
                    updatePhotoWork={props.updatePhotoWork}
                    setPhotosFlagged={props.setPhotosFlagged}
                    movePhotosToTrash={props.movePhotosToTrash}
                    restorePhotosFromTrash={props.restorePhotosFromTrash}
                    toggleShowInfo={this.toggleShowInfo}
                />
                <div className="Library-body">
                    {currentView}
                    {(props.isFetching || (props.isImporting && props.photoCount === 0)) &&
                        <Spinner className="Library-spinner" size={Spinner.SIZE_LARGE} />
                    }
                </div>
                <LibraryBottomBar
                    className="Library-bottomBar"
                    leftItem={props.bottomBarLeftItem}
                    highlightedCount={props.selectedPhotoIds.length}
                    photosCount={props.photoCount}
                    gridRowHeight={props.gridRowHeight}
                    clearHighlight={this.clearHighlight}
                    setGridRowHeight={props.setGridRowHeight}
                />
                <PhotoInfo
                    className="Library-rightSidebar"
                    isActive={state.isShowingInfo}
                    photo={props.infoPhoto}
                    photoDetail={props.infoPhotoDetail}
                    tags={props.tags}
                    closeInfo={this.toggleShowInfo}
                    setPhotoTags={props.setPhotoTags}
                />
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const sections = state.data.sections
        const libraryInfo = state.library.info
        const photoData = libraryInfo && sections.byId[libraryInfo.sectionId].photoData
        return {
            ...props,
            hasPhotoDirs: state.data.settings.photoDirs.length !== 0,
            isFetching: sections.totalPhotoCount === null || sections.fetchState === FetchState.FETCHING,
            isImporting: !!state.import && state.import.progress.phase !== 'error',
            libraryFilterType: state.library.filter.type,
            photoCount: sections.photoCount,
            totalPhotoCount: sections.totalPhotoCount,
            sectionIds: sections.ids,
            sectionById: sections.byId,
            selectedSectionId: state.library.selection.sectionId,
            selectedPhotoIds: state.library.selection.photoIds,
            infoPhoto: (libraryInfo && photoData) ? photoData[libraryInfo.photoId] : null,
            infoPhotoDetail: libraryInfo && libraryInfo.photoDetail,
            tags: getTagTitles(),
            gridRowHeight: state.library.display.gridRowHeight,
        }
    },
    dispatch => ({
        fetchTotalPhotoCount,
        fetchSections,
        fetchTags,
        getGridLayout,
        getThumbnailSrc,
        createThumbnail,
        setDetailPhotoById,
        setInfoPhoto,
        setPhotosFlagged,
        setPhotoTags,
        updatePhotoWork,
        movePhotosToTrash,
        restorePhotosFromTrash,
        startScanning: () => {
            ipcRenderer.send('start-scanning')
        },
        ...bindActionCreators({
            setGridRowHeight: setGridRowHeightAction,
            setSelectedPhotos: setSelectedPhotosAction,
            openExport: openExportAction
        }, dispatch)
    })
)(Library)

export default Connected