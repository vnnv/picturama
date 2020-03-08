import { ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import { PhotoId, Photo as Photo, PhotoDetail, PhotoWork, PhotoSectionId } from 'common/CommonTypes'
import { getNonRawUrl } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'

import PhotoInfo from 'app/ui/info/PhotoInfo'
import { setDetailPhotoByIndex, setPreviousDetailPhoto, setNextDetailPhoto } from 'app/controller/DetailController'
import { updatePhotoWork, movePhotosToTrash, setPhotosFlagged, restorePhotosFromTrash } from 'app/controller/PhotoController'
import { setPhotoTags } from 'app/controller/PhotoTagController'
import { openExportAction, openDiffAction } from 'app/state/actions'
import { getPhotoById, getPhotoByIndex, getLoadedSectionById, getTagTitles } from 'app/state/selectors'
import { AppState } from 'app/state/StateTypes'
import BackgroundClient from 'app/BackgroundClient'

import { DetailMode } from './DetailTypes'
import PhotoDetailBody from './PhotoDetailBody'

import './PhotoDetailPane.less'


interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    devicePixelRatio: number
    sectionId: PhotoSectionId
    photo: Photo
    photoPrev: Photo | null
    photoNext: Photo | null
    photoDetail: PhotoDetail | null
    photoWork: PhotoWork | null
    tags: string[]
    isFirst: boolean
    isLast: boolean
}

interface DispatchProps {
    toggleMaximized(): void
    setPreviousDetailPhoto: () => void
    setNextDetailPhoto: () => void
    getFileSize(path: string): Promise<number>
    updatePhotoWork: (photo: Photo, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: Photo[], flag: boolean) => void
    setPhotoTags: (photo: Photo, tags: string[]) => void
    movePhotosToTrash: (photos: Photo[]) => void
    restorePhotosFromTrash: (photos: Photo[]) => void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    openDiff: () => void
    closeDetail: () => void
}

export interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    mode: DetailMode
    isShowingInfo: boolean
}

export class PhotoDetailPane extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        bindMany(this, 'toggleDiff', 'toggleShowInfo', 'setMode')
        this.state = {
            mode: 'view',
            isShowingInfo: false,
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { props, state } = this
        if (props.isActive !== prevProps.isActive || state.mode !== prevState.mode) {
            ipcRenderer.send('toggleExportMenu', props.isActive && state.mode === 'view')
        }
    }

    private toggleDiff() {
        const photoDetail = this.props.photoDetail
        if (photoDetail && photoDetail.versions.length > 0) {
            this.props.openDiff()
        }
    }

    private toggleShowInfo() {
        this.setState({ isShowingInfo: !this.state.isShowingInfo })
    }

    private setMode(mode: DetailMode) {
        const nextState: Partial<State> = { mode }
        if (mode === 'crop') {
            nextState.isShowingInfo = false
        }
        this.setState(nextState as any)
    }

    render() {
        const { props, state } = this

        return (
            <div
                className={classNames(props.className, 'PhotoDetailPane', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                <PhotoDetailBody
                    topBarClassName='PhotoDetailPane-topBar'
                    bodyClassName='PhotoDetailPane-body'
                    devicePixelRatio={props.devicePixelRatio}
                    isActive={props.isActive}
                    mode={state.mode}
                    isShowingInfo={state.isShowingInfo}
                    sectionId={props.sectionId}
                    photo={props.photo}
                    isFirst={props.isFirst}
                    isLast={props.isLast}
                    src={getNonRawUrl(props.photo)}
                    srcPrev={props.photoPrev && getNonRawUrl(props.photoPrev)}
                    srcNext={props.photoNext && getNonRawUrl(props.photoNext)}
                    orientation={props.photo.orientation}
                    photoWork={props.photoWork}
                    toggleMaximized={props.toggleMaximized}
                    setMode={this.setMode}
                    setPreviousDetailPhoto={props.setPreviousDetailPhoto}
                    setNextDetailPhoto={props.setNextDetailPhoto}
                    toggleDiff={this.toggleDiff}
                    toggleShowInfo={this.toggleShowInfo}
                    updatePhotoWork={props.updatePhotoWork}
                    setPhotosFlagged={props.setPhotosFlagged}
                    movePhotosToTrash={props.movePhotosToTrash}
                    restorePhotosFromTrash={props.restorePhotosFromTrash}
                    openExport={props.openExport}
                    closeDetail={props.closeDetail}
                />

                <PhotoInfo
                    className="PhotoDetailPane-rightSidebar"
                    isActive={state.isShowingInfo}
                    photo={(state.isShowingInfo && props.photo) || null}
                    photoDetail={state.isShowingInfo && props.photoDetail || null}
                    tags={props.tags}
                    closeInfo={this.toggleShowInfo}
                    getFileSize={props.getFileSize}
                    setPhotoTags={props.setPhotoTags}
                />
            </div>
        );
    }

}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const currentPhoto = state.detail!.currentPhoto
        const sectionId = currentPhoto.sectionId
        const section = getLoadedSectionById(state, sectionId)
        return {
            ...props,
            devicePixelRatio: state.navigation.devicePixelRatio,
            sectionId: currentPhoto.sectionId,
            photo: getPhotoById(state, sectionId, currentPhoto.photoId)!,
            photoPrev: getPhotoByIndex(state, sectionId, currentPhoto.photoIndex - 1),
            photoNext: getPhotoByIndex(state, sectionId, currentPhoto.photoIndex + 1),
            photoDetail: currentPhoto.photoDetail,
            photoWork: currentPhoto.photoWork,
            tags: getTagTitles(state),
            isFirst: currentPhoto.photoIndex === 0,
            isLast: !section || currentPhoto.photoIndex === section.photoIds.length - 1
        }
    },
    dispatch => ({
        toggleMaximized: BackgroundClient.toggleMaximized,
        setPreviousDetailPhoto,
        setNextDetailPhoto,
        getFileSize: BackgroundClient.getFileSize,
        updatePhotoWork,
        setPhotosFlagged,
        setPhotoTags,
        movePhotosToTrash,
        restorePhotosFromTrash,
        openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => dispatch(openExportAction(sectionId, photoIds)),
        openDiff: () => dispatch(openDiffAction()),
        closeDetail: () => setDetailPhotoByIndex(null, null)
    })
)(PhotoDetailPane)

export default Connected
