{ pkgs, ... }: {
  systemd.services.duck_vote = {
    description = "PROGRAMMESWAG";
    after = [ "network.target" ];

    serviceConfig = {
      Type = "simple";
      User = "root";
      ExecStart =
        "${pkgs.nodejs-18_x}/bin/node index";
      WorkingDirectory = "/home/nicolas/Desktop/Nico/duck-vote-bot/";
      Restart = "on-failure";
    };

    wantedBy = [ "multi-user.target" ];
  };
}