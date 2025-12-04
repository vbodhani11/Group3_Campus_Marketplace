import "../../style/admin-model.scss";
export default function AddUserModal({ open, onClose, onCreated, }: {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}): import("react/jsx-runtime").JSX.Element | null;
