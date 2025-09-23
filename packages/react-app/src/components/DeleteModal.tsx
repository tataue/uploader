import React from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';

interface DeleteModalProps {
  isOpen: boolean;
  filename: string;
  deleting: boolean;
  error: string;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  filename,
  deleting,
  error,
  onClose,
  onConfirmDelete
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      placement="center"
      size="sm"
      classNames={{
        wrapper: "z-[999999]",
        backdrop: "z-[999998] bg-black/50",
        base: "z-[999999] bg-slate-900 border border-slate-700 text-white",
        header: "border-b border-slate-700",
        footer: "border-t border-slate-700",
      }}
      backdrop="opaque"
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">确认删除</ModalHeader>
            <ModalBody className="py-6">
              <p className="text-white">确定要删除文件 "{filename}" 吗？</p>
              <p className="text-sm text-gray-400">此操作无法撤销。</p>
              {error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onModalClose} 
                disabled={deleting}
                className="text-gray-300 hover:text-white"
              >
                取消
              </Button>
              <Button 
                color="danger" 
                variant="solid"
                onPress={async () => {
                  await onConfirmDelete();
                  if (!error) {
                    onModalClose();
                  }
                }}
                isLoading={deleting}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                删除
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;