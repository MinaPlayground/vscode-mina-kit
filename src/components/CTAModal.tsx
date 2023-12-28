import {FC, PropsWithChildren} from "react";

const CTAModal: FC<PropsWithChildren<CTAModalProps>> = ({
  id, title, children
}) => {
  return (
      <dialog id={id} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          {children}
        </div>
      </dialog>
  );
};

interface CTAModalProps {
  id: string;
  title: string;
}

export default CTAModal;
