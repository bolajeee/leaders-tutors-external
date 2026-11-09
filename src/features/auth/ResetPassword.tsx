import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput } from "@/components/form";
import { AuthFormStepsType } from "@/types/auth/auth";
import {
  ResetPasswordRequestSchema,
  ResetPasswordRequestType,
} from "@/types/auth/schema";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { handleAppError } from "@/lib/axios";
import { showToast } from "@/components/toast";
import {
  getPasswordResetUserId,
  requestPasswordReset,
  savePendingPasswordReset,
} from "@/services/auth";

interface AuthFormStepsProps {
  gotoAuthFormPage: (stepKey: AuthFormStepsType) => void;
}

export const ResetPassword: React.FC<AuthFormStepsProps> = (props) => {
  const { gotoAuthFormPage } = props;
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestType>({
    defaultValues: { email: "" },
    resolver: zodResolver(ResetPasswordRequestSchema),
    mode: "onChange",
  });

  const login = () => {
    gotoAuthFormPage("login");
  };

  const handleRequestReset = async (data: ResetPasswordRequestType) => {
    try {
      setIsPending(true);

      const response = await requestPasswordReset(data.email);
      const pendingReset = getPasswordResetUserId(response, data.email);
      savePendingPasswordReset(pendingReset);

      showToast({
        variant: "success",
        title: "Verification code sent",
        message: "Check your email for the code to reset your password.",
      });
      gotoAuthFormPage("verifyAccount");
    } catch (error) {
      handleAppError({ showToast: true, error });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="flex flex-col gap-5 justify-center items-start animate-fade-up">
      <div className="flex flex-col gap-1">
        <div className="w-20">
          <Image
            src="/body-pix/icon.png"
            alt="Vector"
            className="w-full h-auto"
            width={0}
            height={0}
            unoptimized
          />
        </div>
        <h1 className="text-2xl text-[#1F2937] font-bold-custom">
          Reset <span className="text-[var(--secondary-color)]">Password</span>
        </h1>
        <p className="text-gray-500 text-[16px]">
          Enter your registered email address
        </p>
      </div>

      <TextInput
        id="email"
        label="Email Address"
        message={errors.email?.message}
        disabled={isPending}
        {...register("email")}
      />

      {/* BUTTON */}
      <Button
        onClick={handleSubmit(handleRequestReset)}
        text="Proceed"
        frontIcon={<ArrowRight />}
        fullWidth
        isLoading={isPending}
      />
      <p className="text-sm text-[var(--text-color)]">
        Already have an account?{" "}
        <span
          className="text-[var(--primary-color)] font-medium-custom cursor-pointer hover:underline"
          onClick={login}
        >
          Login Here
        </span>
      </p>
    </section>
  );
};
