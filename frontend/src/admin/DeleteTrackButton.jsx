import React, { useState, useCallback, Fragment } from 'react';
import { Trash2, LoaderCircle, AlertTriangle, X } from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { Dialog, Transition } from '@headlessui/react';

const DeleteTrackButton = React.memo(({ trackId, trackTitle, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const handleDelete = useCallback(async () => {
    
    setIsDeleting(true);
    setError(null);
    
    try {
  await api.delete(`/sounds/${trackId}`);

      onDeleteSuccess(trackId);
      closeModal();
      
    } catch (err) {
      console.error('Track deletion failed:', err);
      setError(err.response?.data?.message || 'Failed to delete track due to a server error.');
      
    } finally {
      setIsDeleting(false);
    }
  }, [trackId, onDeleteSuccess]);

  return (
    <>
      <button
        onClick={openModal}
        className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
        title={`Delete ${trackTitle}`}
        aria-label={`Delete track ${trackTitle}`}
      >
        <Trash2 size={18} />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={!isDeleting ? closeModal : () => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900/80 border border-red-500/30 p-6 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-white flex items-center"
                  >
                    <div className="mr-3 flex-shrink-0 h-10 w-10 grid place-items-center rounded-full bg-red-500/10">
                       <AlertTriangle className="text-red-400" size={20} />
                    </div>
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      Are you sure you want to permanently delete "{trackTitle}"? This action cannot be undone.
                    </p>
                  </div>

                  {error && (
                    <div className="mt-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
                      onClick={closeModal}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-none disabled:bg-red-800 disabled:cursor-not-allowed"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Track'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
});

DeleteTrackButton.propTypes = {
  trackId: PropTypes.string.isRequired,
  trackTitle: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default DeleteTrackButton;