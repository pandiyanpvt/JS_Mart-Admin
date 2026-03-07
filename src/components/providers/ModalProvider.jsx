"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ConfirmationModal } from "../ui/ConfirmationModal";

const ModalContext = createContext(undefined);

export function ModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState(null);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        setOptions(null);
        setIsLoading(false);
    }, []);

    const showModal = useCallback((newOptions) => {
        setOptions(newOptions);
        setIsOpen(true);
    }, []);

    const showAlert = useCallback((title, message, type = "info") => {
        showModal({
            title,
            message,
            type,
            confirmLabel: "OK",
            cancelLabel: null,
            onConfirm: () => Promise.resolve()
        });
    }, [showModal]);

    const showConfirm = useCallback(({ title, message, type = "confirm", confirmLabel, cancelLabel, onConfirm }) => {
        showModal({
            title,
            message,
            type,
            confirmLabel: confirmLabel || "Confirm",
            cancelLabel: cancelLabel || "Cancel",
            onConfirm
        });
    }, [showModal]);

    const handleConfirm = async () => {
        if (options?.onConfirm) {
            setIsLoading(true);
            try {
                await options.onConfirm();
                hideModal();
            } catch (error) {
                console.error("Modal action failed:", error);
                setIsLoading(false);
            }
        } else {
            hideModal();
        }
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal, showAlert, showConfirm, isLoading }}>
            {children}
            {options && (
                <ConfirmationModal
                    isOpen={isOpen}
                    onClose={hideModal}
                    onConfirm={handleConfirm}
                    title={options.title}
                    message={options.message}
                    type={options.type}
                    confirmLabel={options.confirmLabel}
                    cancelLabel={options.cancelLabel}
                    loading={isLoading}
                />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
